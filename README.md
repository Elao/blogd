Blogd
=====

Blogd allow you to retrieve blog's posts and meta from a folder, a git repository or a remote zip and expose them via an API. It's useful when you want to manage a collaborative blog with github for example. Blogd is maintained by [http://www.elao.com](Elao) and is use at [http://www.elao.com/blog](). The content repository of the blog is located at [http://www.github.com/elao/tech-blog]().


# Configuration

Add a *config.js* file (copy / past the config.js.dist for example). Or you can also define a *blogd* config key in your *package.json* file (or in *../../package.json* file).

Example of _config.js_  file

    'use strict';

    exports.port          = process.env.PORT || 5555;
    exports.host 		 = '127.0.0.1';
    exports.store         = 'memory'; // or memory
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

Available configuration options:

<table>
	<tr><th>key</th><th>default</th><th>description</th></tr>
	<tr><td>host</td><td>'127.0.0.1'</td><td>Binded host</td></tr>
	<tr><td>port</td><td>5555</td><td>Binded port</td></tr>
	<tr><td>store</td><td>'memory'</td><td>The store to use to store the blog data (only 'memory' is supported now)</td><tr>
	<tr><td>outputFolder</td><td>'./content'</td><td>The folder where to dump the grabbed content</td></tr>
	<tr><td>backupFile</td><td>'./current.json'</td><td>Path of the file where consolidated json data should be backed up</td></tr>
	<tr>
		<td>assetsToCopy</td>
		<td>[]</td>
		<td>
			array of folder to copy and/or map.<br /> 
			The object should contains: <br />
			<ul>
				<li>__from__ : The folder to copy (*required*)</li>
				<li>__to__ : The destination folder (*required*)</li>
				<li>__url__ : The absolute url to bind the folder (if none, it'll not be mapped)</li>
		</td>
	</tr>
	<tr>
		<td>source</td>
		<td>no default.</td>
		<td>
			Where to find the content.
			<ul>
				<li> __type__ : The type of source (folder, git, zip)</li>
				<li> __url__ : The url of the zip file (for the *type zip*)</li>
				<li> __folder__ : The folder to get data from (for the *type folder*)</li>
				<li> __repository__ : The url of the git repository (for the *type git*)</li>
			</ul>
		</td>
	</tr>
</table>


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
    
Blogd will copy the content of */posts/images/* from your repository, to the Blogd local directory */public/images* and then map the */public/images/* folder to the url */images/*
For example, if you have a file */posts/images/myimage.png* in your repository, you'll be able to access the file to *http://localhost:5555/images/myimage.png*




# Content structure

The content of the source must be structured this way (you can find an example at [https://github.com/Elao/tech-blog]())


##Users file:
Must be at the root of the repo and named _users.json_

_Example of users.json file:_

    [{
        "name":  "Vincent",
        "slug":  "vincent",
        "email": "vincent.bouzeran@elao.com"
    },{
        "name":  "Guewen",
        "slug":  "guewen",
        "email": "guewen.faivre@elao.com"
    }]


##Tags file:
Must be at the root of the repo and be named _tags.json_
It contains the allowed tags used in posts. If a post use a tag not referenced in these file, the tag will be ignored.

_Example of tags.json file:_

    [
        "Symfony2",
        "HTML/CSS",
        "Webdesign",
        "Framework",
        "Osef"
    ]


##Posts file:
The post files must be placed in the /posts folder. Each post must have two files: a markdown file and a meta file.

For each post, you need to have 2 files in the /posts folder

 * The **.md** file that should contains the markdown content of the post
 * The **.meta** file that should contains the meta data for the article.

The two files must have the same name except the extension.

_Example:_

If your post is named "mysuperblogpost", you must have these two files in the /posts folder:

* **mysuperblogpost.md**     (hold the markdown content of the post)
* **mysuperblogpost.meta**   (hold the metas of the post)

##Post meta file
The post meta file contains information about the associated blog post.

The metas are like this:
<table>
	<tr><th>Meta</th><th>Description</th></tr>
	<tr><td>_slug_ \*</td><td>The post's slug (used to identify the post. Must be unique among all posts)</td></tr>
	<tr><td>_title_ \*</td><td>The post's title</td></tr>
	<tr><td>_tags_</td><td>List of post's tag (must be reference by name of tags contains in the tags's file)</td></tr>
	<tr><td>_status_ \*</td><td>The post's status ("published", "draft")</td></tr>
	<tr><td>_publish_by_ \*</td><td>The publisher of the post (must be the reference of a user contains in the users's file either by email or slug)</td></tr>
	<tr><td>_publish_at_ \*</td><td>A date (any format supported by Moment.js)</td></tr>	
	<tr><td>_meta_title_</td><td>The html meta title of the post</td></tr>
	<tr><td>_meta_description_</td><td>The html meta description of the post</td></tr>
</table>
<i><small>* indicate required metas</small></i>

<strong>Additional metas will be exposed by the blogd api.</strong>


_Example of a post meta file:_

    {
        "tags":	           		["Symfony2", "Toto", "Titi"],
        "title":				"Imported post in ghost",
        "slug":					"imported-post-in-ghost",
        "status":				"published",
        "meta_title":			"Imported post in ghost",
        "meta_description":		"An imported post into ghost description",
        "publish_by":"			vincent.bouzeran@elao.com",
        "publish_at":			"2014-07-06"
    }


# TODO
* Add more checks on data
* Add a slugs for tags (for proper api url)
* Add pagination on _/posts/:tag_ & _/authors_
* Add more info to the README (how it works, )
* Add a redis store
