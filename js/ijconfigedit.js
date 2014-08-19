$(document).ready(function(){
  var xml=getParameterByName('xml');
  var include=getParameterByName('include');
  if (include){
    include=new RegExp(include);
    console.log(include);
  }
  var exclude=getParameterByName('exclude');
  if (exclude){
    exclude=new RegExp(exclude);
  }
  if (xml){
    loadConfig(xml,include,exclude);
  }
});

function loadConfig(xml,include,exclude) {
  $.ajax({
    url: xml,
    success: function(xml) {
      prefs.properties={};
      $('entry',xml).each(function(index,entry){
        entry=$(entry)
        var path=entry.attr('key').split('.');
        var bottomLevel=path.length-1;
        var obj=prefs.properties;
        $.each(path,function(i,term){
          if (i==bottomLevel) {
            obj[term]=entry.text();
          } else {
            if (obj[term]==undefined) {
              obj[term]={};
            }
            obj=obj[term];
          }
        });
      });
      console.log(prefs.properties);
      var parseOptions={
        obj: prefs.properties,
        expand: getParameterByName('expand')
      }
      if (include || exclude) {
        parseOptions.filter=function(name){
          if (include && !name.match(include)) return true;
          if (exclude && name.match(exclude)) return true;
          return false;
        }
      }
      $('#config').append(obj2html(parseOptions));
    }
  });

  $('#filter').on('search change',filterList);

  $(document).on('click', 'li.collapsible', function toggleObject() {
    if ($(this).hasClass('collapsed')) {
      $(this).next().show();
      $(this).removeClass('collapsed');
    } else {
      $(this).next().hide();
      $(this).addClass('collapsed')
    }
  });

}

function toXML(options) {
  var xml='';
  if (!options.root) options.root='';
  var path=(options.root.length?options.root+'.':'');
  for (property in options.obj) {
    switch(typeof(options.obj[property])) {
    case 'object': 
      xml+=toXML({
          obj: options.obj[property],
          root: path+property
      });
      break
    default:
      xml+='<entry key="'+path+property+'">'+options.obj[property]+'</entry>\n';
      break;
    }
  }
  return xml;
}

function saveConfig() {
  $.ajax({
      url: 'php/saveconfig.php',
      method: 'POST',
      data: {
        config: JSON.stringify(prefs.properties)
      },
      success: function(data){
        if (data.error){
          console.log(data.error)
          alert(data.error.msg);
        }
        console.log(data.timestamp);
      },
      error: function(){
        alert("Error: cannot save configuration");
        console.log(arguments)
      }
  });
}


