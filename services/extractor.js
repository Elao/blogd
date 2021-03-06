module.exports = function(app, config) {
    return new Extractor(app, config);
}

var _         = require('lodash');
var Promise   = require('bluebird');
var path      = require('path');
var glob      = Promise.promisifyAll(require("glob"));
var fs        = Promise.promisifyAll(require("fs"));
var rimraf    = require('rimraf');
var ncp       = require('ncp').ncp;
var marked    = require("marked");
var highlight = require('highlight.js');

marked.setOptions({
  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  }
});

Extractor = function(app, config) {
    this.app      = app;
    this.config   = config;
    this.sourcer  = require('../source/' + config.source.type)(app, config);

    this.paths = {
        posts:  this.config.outputFolder + "/posts/",
        users:  this.config.outputFolder + "/users.json",
        tags:   this.config.outputFolder + "/tags.json"
    };

    this.data = {
        users:    [],
        tags:     [],
        posts:    []
    };

    return this;
};

var requiredMetas    = ['slug', 'title', 'status', 'publish_by', 'publish_at'];
var requiredTagMetas = ['slug', 'label'];

Extractor.prototype.cleanData = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        rimraf(self.config.outputFolder, function(err) {
            if (err) {
                console.error("Cleaning output folder failed : ", err);
                return reject(err);
            } else {
                return resolve(true);
            }
        })
    });
}

Extractor.prototype.copyPublicAssets = function() {
    var self     = this;
    var promises = [];

    try {
        self.config.assetsToCopy.map(function(toCopy) {
            promises.push(new Promise(function(resolve, reject) {
                self.app.logger.debug("[ASSETS] from "+toCopy.from+" => "+toCopy.to);
                fs.exists(toCopy.from, function(exists) {
                    if (!exists) {
                        self.app.logger.error("Assets folder not found: "+toCopy.from);
                        return resolve(true);
                    } else {
                        try{
                            rimraf(toCopy.to, function(err) {
                                if (err) {
                                    console.log("[ASSETS] Error cleaning : "+toCopy.to+" : "+err.message);
                                    return resolve(true);
                                } else {
                                    ncp(toCopy.from, toCopy.to, function(err) {
                                        if (err) {
                                            console.error("[ASSETS] " + toCopy.from + " "+err.message);
                                        } else {
                                            self.app.logger.debug("[ASSETS] Copying folders succeed");    
                                        }
                                        return resolve(true);
                                    });
                                }
                            })
                        }catch(e) {
                            console.error("Error ncp : ", e);
                            reject(e);
                        }
                    }
                })
            }));
        });
        return Promise.all(promises);
    } catch(e) {
        console.log("Error :( ", e);
    }
}

Extractor.prototype.refreshData = function(fromCache) {
    var self    = this;
    var errors  = [];
    var warning = [];
    var refreshResult = {
        status:     undefined,
        errors:     [],
        warning:    [],
        data:       undefined
    };

    self.app.logger.info("Refreshing data "+(fromCache ? "from cache" : "from source"));

    return new Promise(function(resolve, reject) {
                if (fromCache) {
                    return resolve(true);
                } else {
                    return resolve(self.cleanData());      // Clean temporary folder
                }
            })
            .then(function() {
                return fromCache ? true : self.sourcer.load(self.config.outputFolder); // Try to load data in the temporary folder
            })
            .then(function() {
                self.app.logger.debug("Loading posts...");
                return self.loadPosts();        // Try to load posts
            })
            .then(function(posts) {
                self.data.posts = posts;
                self.app.logger.debug("Loading users...");
                return self.loadUsers();        // Try to load users
            })
            .then(function(users) {
                self.data.users = users;
                self.app.logger.debug("Loading tags...");
                return self.loadTags();         // Try to load tags
            })
            .then(function(tags) {
                self.app.logger.debug("Checking data...");
                self.data.tags = tags;
                return self.verifyData();       // Verify data
            })
            .then(function(verifyResult) {
                refreshResult.errors  = _.map(verifyResult.errors, function(e) { return e.message; });
                refreshResult.warning = verifyResult.warnings;
                self.app.logger.debug("Data checked status "+(refreshResult.status ? "failed" : "success"));
                if (refreshResult.errors.length > 0) {
                    refreshResult.status = false;
                    return;
                } else {
                    refreshResult.status = true;
                    self.app.logger.debug("Copying assets");
                    return fromCache ? true : self.copyPublicAssets();   // Copy the public assets data into the main folder
                }
            })
            .then(function() {
                if (refreshResult.status) {
                    refreshResult.data = self.data;
                }
                self.app.logger.debug("Assets copied");
                return refreshResult;
            }).catch(function(e) {
                refreshResult.errors.push(e);
                return refreshResult;
            })
}

Extractor.prototype.loadPosts = function(fromPath) {
    var self = this;
    return  new Promise(function(resolve, reject) {
                    glob(self.paths.posts+"/*.md", {}, function(err, postsFiles) {
                        if(err) { return reject(err); }
                        return resolve(postsFiles);
                    });
            }).then(function(postsFiles) {
                return Promise.map(postsFiles, function(postFile) {
                    var fileName     = path.basename(postFile, ".md");
                    var metaFileName = fileName + ".meta";
                    var metaFilePath = path.dirname(postFile) + "/" + metaFileName;

                    return Promise.props({
                        metas:    fs.readFileAsync(metaFilePath),
                        content:  fs.readFileAsync(postFile),
                        fileName: fileName
                    }).then(function(postInfo) {
                        try {
                            postInfo.metas   = JSON.parse(postInfo.metas);
                            postInfo.content = marked(postInfo.content.toString().trim());
                            return postInfo;
                        } catch(e) {
                            throw new Error("Error parsing " + postInfo.fileName + " : " + e.message);
                        }
                    });
                });
            });
}

Extractor.prototype.loadUsers = function() {
    var self = this;
    return fs.readFileAsync(self.paths.users)
           .then(function(usersFileContent) {
                try {
                    users = JSON.parse(usersFileContent);
                    return users;
                } catch(e) {
                    throw new Error("Error parsing users file " + e.message);
                }
           });
}

Extractor.prototype.loadTags = function() {
    var self = this;
    return fs.readFileAsync(self.paths.tags)
           .then(function(tagsFileContent) {
                try {
                    tags = JSON.parse(tagsFileContent);
                    return tags;
                } catch(e) {
                    throw new Error("Error parsing tags file " + e.message);
                }
           });
}

Extractor.prototype.verifyData = function() {
    var self   = this;

    return new Promise(function(resolve, reject) {
        var errors   = [];
        var warnings = [];
        var slugs    = [];

        // Check the tags
        if (!_.isArray(self.data.tags)) {
            errors.push(new Error('The tags file must contains an array of tags'));
        } else {
            _.each(self.data.tags, function(tag) {
                if (!_.isObject(tag)) {
                    errors.push(new Error("Tags must be objects"));
                } else {
                    var missingMetas = _.filter(requiredTagMetas, function(property) { return tag[property] == undefined });
                    if (missingMetas.length > 0) {
                        errors.push(new Error("Invalid Tag " + tag + ": Missing properties : " + missingMetas.join(', ')));
                    }
                }
            });
        }

        if (errors.length > 0) {
            return resolve({errors: errors, warnings: []});
        }

        _.each(self.data.posts, function(post, i) {
            // Check required meta
            var missingMetas = _.filter(requiredMetas, function(property) { return !post.metas[property] });
            if (missingMetas.length > 0) {
                errors.push(new Error(" [Post " + post.fileName + "] is missing metas : '"+missingMetas.join(', ')+"'"))
                delete self.data.posts[i];
                return;
            }

            var slug = post.metas.slug.toLowerCase();
            if (_.contains(slugs, slug)) {
                delete self.data.posts[i];
                errors.push(new Error(" [Post " + post.fileName + "] has a duplicate slug"));
            }
            slugs.push(slug);

            // Check article tags
            if (post.metas.tags) {
                var tagsLabels = _.indexBy(self.data.tags, 'label');
                var tagsSlugs  = _.indexBy(self.data.tags, 'slug');

                var postTags     = [];
                var notFoundTags = [];

                _.each(post.metas.tags, function(postTag) {
                    if (_.has(tagsSlugs, postTag)) {
                        postTags.push(tagsSlugs[postTag]);
                    } else if (_.has(tagsLabels, postTag)) {
                        postTags.push(tagsLabels[postTag]);
                    } else {
                        notFoundTags.push(postTag);
                    }
                });


                if (notFoundTags.length > 0) {
                    warnings.push(" [Post "+post.fileName+"] Unknow tags : '" + notFoundTags.join(', ') + "' will be ignored");
                }
                post.metas.tags = postTags;
            }

            // Check article publisher
            var publisher = post.metas.publish_by;
            var user      = _.filter(self.data.users, function(u) {
                return _.contains(publisher, '@') ? (u.email.toLowerCase() == publisher) : (u.slug == publisher);
            });
            if (user.length !== 1) {
                errors.push(new Error("Post : " + post.fileName + " no user found with slug or email : '"+publisher+"'"));
                delete self.data.posts[i];
                return;
            }
        });

        return resolve({errors: errors, warnings: warnings});
    });

}

Extractor.prototype.finalizeData = function(data) {
    return new Promise(function(resolve, reject) {
        return resolve(data);
    });

    var newData = {
        users:      [],
        posts:      [],
        tags:       [],
        posts_tags: []
    }

    var users_by_email = [];
    var users_by_slug  = [];
    var tags_by_slug   = [];

    _.each(data.users, function(user, uid) {
        uid += 1;

        users_by_email[user.email.toLowerCase()] = uid;
        users_by_slug[user.slug.toLowerCase()]   = uid;

        newData.users.push({
            id:         uid,
            name:       user.name,
            slug:       user.slug,
            email:      user.email,
            image:      user.image,
            website:    user.website
        });
    });

    _.each(data.tags, function(tag, tid) {
        tid += 1;
        tags_by_slug[tag.toLowerCase()] = tid;
        newData.tags.push({
            id:         tid,
            name:       tag,
            slug:       tag.toLowerCase()
        });
    });

    var post_tag_id = 1;
    _.each(data.articles, function(article, pid) {
        pid += 1;
        var publisher = article.metas.publish_by;
        author_id = _.contains(publisher, '@') ? users_by_email[publisher.toLowerCase()] : users_by_slug[publisher.toLowerCase()];

        newData.posts.push({
            id:                 pid,
            title:              article.metas.title,
            slug:               article.metas.slug,
            markdown:           article.content.toString(),
            html:               article.content.toString(),
            meta_title:         article.metas.meta_title,
            meta_description:   article.metas.meta_description,
            author_id:          author_id,
            published_at:       Date.now(),
            created_at:         Date.now(),
            status:             article.metas.status
        });

        _.each(article.metas.tags, function(tag) {
            if (tags_by_slug[tag.toLowerCase()]) {
                newData.posts_tags.push({
                    id:       post_tag_id,
                    post_id:  pid,
                    tag_id:   tags_by_slug[tag.toLowerCase()]
                });
                post_tag_id++;
            }
        });
    });

    return newData;
}



