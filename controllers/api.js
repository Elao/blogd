module.exports = function (app, config) {
    return new Controller(app, config);
}

var _                      = require('lodash'),
    Promise                = require('bluebird');

Controller = function(app, config) {
    this.app    = app;
    this.config = config;

    return this;
}

Controller.prototype.getPostsAction = function() {
    var self = this;
    return function(req, res, next) {
        self.app.db.getPosts(req.param('tag')).then(function(posts) {
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
        self.app.db.getAuthors().then(function(articles) {
            res.json(articles);
        });
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
