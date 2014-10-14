Blogd
=====

Blogd allow you to retrieve blog's posts and meta from a folder or git repository and expose them via an API.


# Configuration

Add a *config.js* file (copy / past the config.js.dist for example).

Example of _config.js_  file

    'use strict';

    exports.port          = process.env.PORT || 5555;
    exports.store         = 'memory'; // or memory
    exports.debug         = true;
    exports.outputFolder  = __dirname + "/content";
    exports.backupFile    = __dirname + "/current.json";
    exports.assetsToCopy  = [{
        from: exports.outputFolder + "/posts/images/",
        to:   __dirname + "/public/images"
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
	<tr><td>GET</td><td>/posts</td><td>_none_</td><td>Retrieve list of blog's post ordered by publish date desc</td></tr>
	<tr><td>GET</td><td>/posts?tag=:tag</td><td>tag: a tag</td><td>Retrive list of blog's post by tag</td></tr>
	<tr><td>GET</td><td>/posts/:slug</td><td>slug: a post's slug</td><td>Retrieve a single post</td></tr>
	<tr><td>GET</td><td>/tags</td><td>_none_</td><td>Retrieve the list of available tags</td></tr>
	<tr><td>GET</td><td>/authors</td><td>_none_</td><td>Retrieve the list of authors</td></tr>
    <tr><td>GET</td><td>/authors/:slug</td><td>slug: slug or email of an author</td><td>Retrieve an author</td></tr>
    <tr><td>GET</td><td>/authors/:slug/posts</td><td>slug: slug or email of an author</td><td>Retrieve list of posts from given author</td></tr>    
	<tr><td>GET</td><td>/status</td><td>_none_</td><td>Retrieve the content status (last update, number of tags, posts, authors, ...)</td></tr>
	<tr><td>GET</td><td>/refresh</td><td>_none_</td><td>Force the refresh of the data by retrieving the remote data from the source</td></tr>
</table>



# TODO
* Add more checks on data
* Add a slugs for tags (for proper api url)
* Add pagination on _/posts_, _/posts/:tag_ & _/authors_
* Publish the private dependencie amabla-core
* Add more info to the README (how it works, )
* Add a redis store
