module.exports = function (app, config) {
    return new Controller(app, config);
}

var _                      = require('lodash'),
    Promise                = require('bluebird'),
    util                   = require('util');

Controller = function(app, config) {
    this.app    = app;
    this.config = config;

    return this;
}

Controller.prototype.getPostsAction = function() {
    var self = this;
    return function(req, res, next) {
        var params = {};

        if (req.param('tag') && util.isString(req.param('tag'))) {
            params.tag = req.param('tag');
        }

        if (req.param('limit') && parseInt(req.param('limit')) > 0) {
            params.limit = parseInt(req.param('limit'));
        }

        if (req.param('offset') && parseInt(req.param('offset')) > 0) {
            params.offset = parseInt(req.param('offset'));
        }

        self.app.db.getPosts(params).then(function(posts) {
            return res.json(posts || []);
        }).catch(function(e) {
            return res.json(e);
        })
    }
}

Controller.prototype.getPostAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getPost(req.param('slug'))
            .then(function(post) {
                return res.json(post);
            }).catch(function(e) {
                return res.json(404, e);
            });
    }
}

Controller.prototype.getTagsAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getTags().then(function(articles) {
            res.json(articles);
        });
    }
}

Controller.prototype.getAuthorsAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getAuthors().then(function(authors) {
            res.json(authors);
        });
    }
}

Controller.prototype.getAuthorAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getAuthor(req.param('slug'))
            .then(function(author) {
                return res.json(author);
            }).catch(function(e){
                return res.json(404, e);
            });
    }
}

Controller.prototype.getAuthorPostsAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getAuthor(req.param('slug'))
            .then(function(author) {
                self.app.db.getPosts({author: author})
                    .then(function(posts) {
                        res.json(posts);
                    })
            }).catch(function(e){
                return res.json(404, e);
            })
    }
}

Controller.prototype.getStatusAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getStatus()
        .then(function(status) {
            return res.json(status);
        }).catch(function(e){
            return res.json(400, "Error: " + e);
        })
    }
};

Controller.prototype.getRefreshAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.extractor.refreshData()
        .then(function(refreshResult){
            if (refreshResult.status) {
                return self.app.db.load(refreshResult.data)
                       .then(function() {
                            return res.json(_.omit(refreshResult, 'data'));
                        })
            } else {
                return res.json(400, refreshResult);
            }
        })
        .catch(function(e) {
            console.log("error: ", e);
            var warnings = [];
            return res.json({
                status:    "failed",
                errors:    e.stack,
                warnings:  warnings
            });
        })
    };
}
