module.exports = (function() {

  function pad(s, n) { 
    var ss = s+'';
    while(ss.length < 2)
      ss = '0' + ss;
    return ss;
  }

  function timestamp() {
    var d = new Date(),
        date_fact = [
          d.getFullYear(),
          pad(d.getMonth() + 1, 2),
          pad(d.getDate(), 2)
        ].join('-'),
        time_str = [
          pad(d.getHours(), 2),
          pad(d.getMinutes(), 2),
          pad(d.getSeconds(), 2)
        ].join(':'),
        date_str = [
          date_fact,
          time_str
        ].join(' ');

    return date_str;
  }

  function Logger(name) {
    var Log;

    Log = function(msg) {
      sails.log('['+name+']['+timestamp()+'] ' + msg);
    };

    return Log;
  }

  return Logger;

})();
