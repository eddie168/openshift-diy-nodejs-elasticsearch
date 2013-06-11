openshift-diy-nodejs-elasticsearch
==========================

Thanks for the great work by [razorinc](https://github.com/razorinc/elasticsearch-openshift-example) and [creationix](https://github.com/creationix/nvm/), this repo let you test Node.js (v0.8 and above) with ElasticSearch in a OpenShift DIY application. For Node.js, it will first check for pre-compiled linux version, then compile from source if not found.

[node-supervisor](https://github.com/isaacs/node-supervisor) is used to automatically restart the node.js app if somehow crashed.

Usage
-----

Create an DIY app

    rhc app create -t diy-0.1 -a yourapp

Add this repository

    cd yourapp
    git remote add nodejsES -m master git://github.com/eddie168/openshift-diy-nodejs-elasticsearch.git
    git pull -s recursive -X theirs nodejsES master

Then push the repo to openshift

    git push

If pre-compiled node.js binary is not available, first push will take a while to finish.

You can specify the node.js script to start with in `package.json` as described [here](https://openshift.redhat.com/community/kb/kb-e1048-how-can-i-run-my-own-nodejs-script).

Check the end of the message for Node.js and ElastisSearch version:

    remote: Starting application...
    remote: Node Version:
    remote: { http_parser: '1.0',
    remote:   node: '0.8.16',
    remote:   v8: '3.11.10.25',
    remote:   ares: '1.7.5-DEV',
    remote:   uv: '0.8',
    remote:   zlib: '1.2.3',
    remote:   openssl: '1.0.0f' }
    remote: ElasticSearch Version: 0.20.2, JVM: 23.2-b09
    remote: nohup supervisor server.js >/var/lib/stickshift/xxxxxxxxxxxxxxxxxx/diy-0.1/logs/server.log 2>&1 &
    remote: Done

In this case it is node `v0.8.16` and elasticsearch `0.20.2`

You can find node.js app's log at `$OPENSHIFT_DIY_LOG_DIR/server.log`. Subsequent `push` will rename the log file with a time stamp before overwritten. The same goes to ElasticSearch log file and can be found at `$OPENSHIFT_DIY_LOG_DIR/elasticsearch.log`. 
You should be able to see these log files with `rhc tail -a yourapp`.

Now open your openshift app in browser and you should see the standard openshift sample page. Enjoy!!

Settings
--------

Edit `config_diy.json`

    {
      "nodejs": {
        "version": "v0.8.16",
        "removeOld": true
      },
      "elasticsearch": {
        "version": "0.20.2",
        "port": 19200,
        "ES_HEAP_SIZE": "256m",
        "removeOld": true
      }
    }

- `nodejs.version`: change node.js version (keep the `v` letter in front)
- `nodejs.removeOld`: delete previous installed node.js binarys
- `elasticsearch.version`: change elasticsearch version
- `elasticsearch.port`: port used by elasticsearch (Refer to [here](https://openshift.redhat.com/community/kb/kb-e1038-i-cant-bind-to-a-port))
- `elasticsearch.ES_HEAP_SIZE`: Refer to [here](http://www.elasticsearch.org/guide/reference/setup/installation.html)
- `elasticsearch.removeOld`: delete previous installed elasticsearch binarys

`commit` and then `push` to reflect the changes to the OpenShift app.

**Note that `v0.6.x` won't work with this method.**

Use ElasticSearch in Node.js
----------------------------

An environment variable `ES_PORT` is defined. Simply make a http connection to ElasticSearch server with `ES_PORT`. For example:

    var esServer = "http://"+process.env.OPENSHIFT_DIY_IP+":"+process.env.ES_PORT+"/";
    http.get(esServer, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (data) {
        console.log('BODY: %s',data);
      });
    }).on('error', function (err) {
      console.log('ES ERROR: %s', err);
    });

