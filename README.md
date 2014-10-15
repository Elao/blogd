Blogd
=====

Blogd allow you to retrieve blog's posts and meta from a folder or git repository and expose them via an API.


# Configuration

Add a *config.js* file (copy / past the config.js.dist for example). Or you can also define a *blogd* config key in your *package.json* file (or in *../../package.json* file).

Example of _config.js_  file

    'use strict';

    exports.port          = process.env.PORT || 5555;
    exports.store         = 'memory'; // or memory
    exports.debug         = true;
    exports.outputFolder  = __dirname + "/content";
    exports.backupFile    = __dirname + "/current.json";
    exports.assetsToCopy  = [{
        from: exports.outputFolder + "/posts/images/",
        to:   __dirname + "/public/images",
        url: "/images/"
    }];

    exports.security = {
        rules: {
            guest:  {},
            admin:  {}
        },
        basic: {
            realm:    'Blogd Private Api',
            user:     'admin',
            password: 'private'
        }
    };

    exports.source = {
        type:        'zip',
        url:         'https://github.com/Elao/tech-blog/archive/master.zip'
    }




# API

<table>
	<tr><th>Method</th><th>Route</th><th>Params</th><th>Description</th><tr>
	<tr><td>GET</td><td>/posts</td><td><em>limit</em> The number of posts to retrieve<br /><em>offset</em> The offset </td><td>Retrieve list of blog's post ordered by publish date desc</td></tr>
	<tr><td>GET</td><td>/posts/:tag</td><td>tag: a tag</td><td>Retrive list of blog's post by tag</td></tr>
	<tr><td>GET</td><td>/post/:slug</td><td>slug: a post's slug</td><td>Retrieve a single post</td></tr>
	<tr><td>GET</td><td>/tags</td><td>_none_</td><td>Retrieve the list of available tags</td></tr>
	<tr><td>GET</td><td>/authors</td><td>_none_</td><td>Retrieve the list of authors</td></tr>
    <tr><td>GET</td><td>/authors/:slug</td><td>slug: slug or email of an author</td><td>Retrieve an author</td></tr>
    <tr><td>GET</td><td>/authors/:slug/posts</td><td>slug: slug or email of an author</td><td>Retrieve list of posts from given author</td></tr>    
	<tr><td>GET</td><td>/status</td><td>_none_</td><td>Retrieve the content status (last update, number of tags, posts, authors, ...)</td></tr>
	<tr><td>GET</td><td>/refresh</td><td>_none_</td><td>Force the refresh of the data by retrieving the remote data from the source</td></tr>
</table>


# Assets mapping

In your config, you can define mapped directories from your source, to a folder and an url.
For example:
    exports.assetsToCopy  = [{
        from: exports.outputFolder + "/posts/images/",
        to:   __dirname + "/public/images",
        url: "/images/"
    }];
    
Blogd will copy the content of */posts/images/* from your repository, to the local directory */public/images* and then map the */public/images/* folder to the url */images/*
For example, if you have a file */posts/images/myimage.png* in your repository, you'll be able to access the file to *http://localhost:5555/images/myimage.png*


# TODO
* Add more checks on data
* Add a slugs for tags (for proper api url)
* Add pagination on _/posts/:tag_ & _/authors_
* Add more info to the README (how it works, )
* Add a redis store
