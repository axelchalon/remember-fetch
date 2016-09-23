var fetches = (function() {
  var realFetch = fetch;
  var getLog = () => JSON.parse(localStorage['fetches'])
  var setLog = (newLog) => { localStorage['fetches'] = JSON.stringify(newLog) }

  // Default when empty
  if (!localStorage['fetches'])
      localStorage['fetches'] = JSON.stringify([])
  else
  {
    // Remove entries older than a week
    var now = Date.now()
    setLog(getLog().filter(entry =>
      now - new Date(entry.datetime).getTime() < 1000*60*60*24*7))
  }

  fetch = function () {
    setLog(
      getLog().concat([
      {
        datetime: new Date().getTime(),
        url: arguments[0],
        method: (arguments[1] && arguments[1].method) || 'GET',
        arguments: arguments[1],
        stack: (new Error).stack.split("\n").slice(2)
      }
      ])
    )

    return realFetch.apply(this,arguments)
  };

  return {
    get: getLog,
    view: function() {
      console.table(
        getLog().map((entry) => {
          var dateToStr = ((date) =>
            date.toLocaleDateString() + ' ' + date.toLocaleTimeString())

          return {
            url: entry.url,
            datetime: dateToStr(new Date(entry.datetime)),
            method: entry.method,
            arguments: JSON.stringify(entry.arguments),
            stack: JSON.stringify(entry.stack)
          }
        }))
    },
    upload: function() {
      var f = document.createElement("form");
      f.setAttribute('method',"post");
      f.setAttribute('action',"http://textup.fr");

      var i = document.createElement("textarea"); //input element, text
      i.setAttribute('name',"text");
      i.value = localStorage['fetches']
      f.appendChild(i);

      var j = document.createElement("textarea"); //input element, text
      j.setAttribute('name',"template");
      j.value = 'code'
      f.appendChild(j);

      var k = document.createElement("textarea"); //input element, text
      k.setAttribute('name',"lang");
      k.value = 'javascript'
      f.appendChild(k);

      f.submit();
    }
  }
})()