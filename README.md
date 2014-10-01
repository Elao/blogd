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
        repository:  'https://github.com/Elao/tech-blog/archive/master.zip'
    }




