![image](https://cloud.githubusercontent.com/assets/1545348/9281373/9adebb96-4292-11e5-8883-2089f1beb23c.png)

The loftili api is the "center-piece" of the loftili platform. It is responsible for maintaining all persistant platform data as well as acting as the bridge between the [core](https://github.com/loftili/core) and [ui](https://github.com/loftili/ui)/[ios](https://github.com/loftili/ios) clients. The api is built off the [sailsjs](https://sailsjs.org) mvc framework, but has parted from the framework in several areas:

1. controllers return only json data (with other formats in the backlog) - no ejs or html views
2. configuration using [dotenv](https://www.npmjs.com/package/dotenv) instead of the [local.js](http://sailsjs.org/documentation/concepts/configuration/the-local-js-file) configuration file mentioned in the documentation
3. disabled default/blueprint routes. this was done to give api development more control over the business logic needed in the controllers.
 
## Getting up and running

In order to start developing locally, you will need to take care of a few pre-requisites:

### 1. **install [node](https://nodejs.org) and [redis](http://redis.io/)**

Our production server runs node [v0.10.33](http://nodejs.org/dist/v0.10.33/node-v0.10.33.tar.gz) and redis [v2.8.21](https://github.com/antirez/redis/archive/2.8.21.tar.gz). Node is our application's runtime and redis is used for session management as well as the mangement of [track order](https://github.com/loftili/api/blob/master/api/services/StreamManager.js) in our streams.

*note for redis:* you do not actually need to install redis as a daemon on your system; simply running `redis-server` will open up the server in the foreground.

You will also need a [mysql](http://dev.mysql.com/downloads/mysql/) server, which is used by the application to store all user, artist, track and other persistant information.

### 2. clone the repository and install packages

At this point you should be able to execute both the `npm` and `node` binaries from your terminal. [npm](http://npmjs.com) is the node packagement management tool, similar to what [ruby gems](https://rubygems.org/) is to ruby. With npm, you should now install the necessary packages:

```
$ git clone git@github.com:loftili/api.git
$ cd ./api
$ npm install
```

### 3. prepare `.env` file

Instead of managing multiple environment files, context-specific configuration information is stored in a `.env` file which is then loaded in via [dotenv](https://www.npmjs.com/package/dotenv). You can see this happeneing in the `connections.js` configuration file:

```
var dotenv = require('dotenv');

module.exports.connections = (function() {

  if(!process.env['A2DBHN'])
    dotenv.load();

  return {

    a2_db: {
      adapter: 'sails-mysql',
      host: process.env['A2DBHN'],
      user: process.env['A2DBUN'],
      password: process.env['A2DBPW'],
      database: process.env['A2DBDB']
    }

  };

})();
```

A complete example of a `.env` needed to run the loftili api can be seen [here](https://gist.github.com/dadleyy/67a19c9927b53899aebb).

### 4. running the migrations

The api uses [knex](http://knexjs.org/) to handle it's [database migratoions](https://en.wikipedia.org/wiki/Schema_migration). After running the `npm install` command from step 2, you can find the knex executable under `./node_modules/.bin/knex`. If you are unfamilar with this command line tool, you can view the help information by running `./node_modules/.bin/knex --help`:

```
$ ./node_modules/.bin/knex --help

  Usage: knex [options] [command]


  Commands:

    init [options]                         Create a fresh knexfile.
    migrate:make [options] <name>   Create a named migration file.
    migrate:latest                         Run all migrations that have not yet been run.
    migrate:rollback                       Rollback the last set of migrations performed.
    migrate:currentVersion                View the current version for the migration.

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    --debug            Run with debugging.
    --knexfile [path]  Specify the knexfile path.
    --cwd [path]       Specify the working directory.
    --env [name]       environment, default: process.NODE_ENV || development

```
So, in order to get your databse up to snuff, you will need to run:

```
$ ./node_modules/.bin/knex migrate:latest
```

This will take care of running though all the migrations in our [migrations](https://github.com/loftili/api/tree/master/migrations) directory, applying each one at a time.

### 5. Running the application & using [forever](https://github.com/foreverjs/forever)

With the environment configured, both redis/mysql available, and the migrations applied, it is time to run the application. This can be done two ways:

1. running the `app.js` file in the foreground:
    ```
    $ node ./app.js
    ```
2. using `forever` to run the application in the background:
    ```
    $ forever start -w ./app.js
    ```

We prefer using the second approach, as the `w` flag will *watch* the source code, refreshing the application each time a change is detected.


## Contributing

Contributions are very welcome, and anyone interested in contributing to LFTAPI should follow the guide published by [github](https://guides.github.com/activities/contributing-to-open-source/), and [create an issue](https://github.com/loftili/api/issues), or just fork the repository, make your change, and open a [pull request](https://github.com/loftili/api/pulls).


## License

Please see [LICENSE.txt](https://github.com/loftili/api/blob/master/LICENSE.txt)
