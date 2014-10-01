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
      admin:  {} //methods: ['http'],  callback: function(user){ return user.username == 'admin'; }}
    },
    basic: {
      realm:    'BlogD Private Api',
      user:     'admin',
      password: 'private'
    }
};

/*
exports.source = {
    type:       'git',
    repository: 'https://github.com/symfony/symfony-standard.git' // SSL is not supported
}
exports.source = {
    type:       'local',
    path:       '/tmp/repo'
}
exports.source = {
    type:       'zip',
    url:        'http://github.com/Elao/node-module-assets-gulp/archive/master.zip'
}
*/
