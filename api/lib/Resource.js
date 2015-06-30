var request = require('request'),
    lodash = require('lodash');

module.exports = (function() {

  var default_actions = {
        get: { method: "GET" },
        update: { method: "PUT", has_body: true },
        save: { method: "POST", has_body: true },
        query: { method: 'GET', isArray: true },
        destroy: { method: "DELETE" }
      },
      extend = lodash.extend,
      each = lodash.forEach;

  function isValidDottedPath(path) {
    var not_null = path != null,
        not_empty = path !== '',
        not_prop = path !== 'hasOwnProperty',
        dot_path = ['.', path].join(''),
        is_member = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/.test(dot_path);

    return not_null && not_empty && not_prop && is_member;
  }

  function lookupDottedPath(obj, path) {
    var valid_path = isValidDottedPath(path),
        keys, i, ii;

    if(!valid_path)
      return false;

    keys = path.split('.');
    i = 0;
    ii = keys.length;

    for(i; i < ii && obj !== undefined; i++) {
      var key = keys[i];
      obj = (obj !== null) ? obj[key] : undefined;
    }

    return obj;
  }

  function extract(data, mappings) {
    var result = {};

    function lookup(path) {
    }

    for(var name in mappings) {
      var map = mappings[name],
          extracted = false;

      if(typeof(map) === 'function') {
        extracted = map(data);
      } else if(typeof(map) === 'string') {
        extracted = map.charAt(0) === '@' ? lookupDottedPath(data, map.substr(1)) : map;
      }

      if(extracted)
        result[name] = extracted;
    }

    return result;
  }

  function replacementFactory(value) {
    return (function(match, p1) {
      return value + p1;
    });
  }

  function clearParam(match, leading_slashes, tail) {
    var has_lead = tail.charAt(0) == '/';
    return has_lead ? tail : leading_slashes + tail;
  }

  function compileUrl(template, data) {
    var splits = template.split(/\W/),
        param_count = splits.length,
        template_params = {},
        i = 0,
        result = template.replace(/\\:/g, ':');

    for(i; i < param_count; i++) {
      var param = splits[i];
      
      if(param === 'hasOwnProperty') continue;

      var is_param_rgx = new RegExp("(^|[^\\\\]):"+param+"(\\W|$)"),
          is_num = /^\d+$/.test(param);

      if(param && is_param_rgx.test(template) && !is_num) template_params[param] = true;
    }

    for(var name in template_params) {
      var val = data.hasOwnProperty(name) ? data[name] : null,
          is_defined = val !== undefined,
          not_null = val !== null,

          substitute_rgx = new RegExp(":"+name+"(\\W|$)", "g"),
          empty_rgx = new RegExp("(\/?):"+name+"(\\W|$)", "g"),

          // encoded_val = encodeUriSegment(val),
          replacement_fn, replacement_rgx,
          additional_params = '';

      if(is_defined && not_null) {
        replacement_fn = replacementFactory(val);
        replacement_rgx = substitute_rgx;
      } else {
        replacement_fn = clearParam;
        replacement_rgx = empty_rgx;
      }

      result = result.replace(replacement_rgx, replacement_fn);
      result = result.replace(/\/\.(?=\w+($|\?))/, '.');
    }

    return result;
  }

  function ResourceFactory(url_template, url_mappings, additional_actions, http_config, additional_query) {
    var actions = extend({}, default_actions, additional_actions),
        Resource = {};

    function createAction(action_definition) {
      var mappings = extend({}, url_mappings, action_definition.params),
          method = action_definition.method,
          has_body = action_definition.has_body === true;

      function action(data, callback) {
        var url_params = extract(data, mappings),
            extracted = [],
            compiled_path = compileUrl(url_template, url_params),
            leftover = {},
            query_string = '',
            request_config = {
              method: method,
              headers: extend({}, (http_config || {}).headers)
            };

        each(url_params, function(value, name) { extracted.push(name); });

        each(extend({}, additional_query, data), function(value, name) {
          if(extracted.indexOf(name) >= 0) return;
          leftover[name] = value;
          query_string += '&' + [name, value].join('=');
        });

        query_string = query_string.replace(/^&/, '');

        function finished(err, data) {
          if(err)
            return callback(err, null);

          callback(null, data);
        }

        request_config.url = has_body ? compiled_path : [compiled_path, query_string].join('?');

        if(has_body)
          request_config.json = leftover;

        request(request_config, finished);
      }

      return action;
    }

    for(var action_name in actions) {
      Resource[action_name] = createAction(actions[action_name]);
    }

    return Resource;
  }

  return ResourceFactory;

})();
