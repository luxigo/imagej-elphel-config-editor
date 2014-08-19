/*
 * imagej-elphel-config-editor
 *
 * Copyright (c) 2014 FOXEL SA - http://foxel.ch
 * Please read <http://foxel.ch/license> for more information.
 *
 * This file is part of the FOXEL project <http://foxel.ch>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Additional Terms:
 *
 *      You are required to preserve legal notices and author attributions in
 *      that material or in the Appropriate Legal Notices displayed by works
 *      containing it.
 *
 *      You are required to attribute the work as explained in the "Usage and
 *      Attribution" section of <http://foxel.ch/license>.
 *
 * This file : jsob2html.js
 * Author(s) : Luc Deschenaux <l.deschenaux@foxel.ch> 
 *
 */

/**
 * @param: options.obj the object to parse
 * @param: options.root the root level (default: '')
 * @param: options.filter(path) function return true to exclude path from gui
 * @param: options.expand set to true or recursive to expand objects
 */
function obj2html(options) {
  var tree=$('<ul></ul>');
  if (!options.root) options.root='';
  for (property in options.obj) {
    var path=options.root+property;
    if (options.filter && options.filter(path)) continue;
    switch(typeof(options.obj[property])) {
      case 'object' :
        var insertPoint=null;
        $('> .collapsible',tree).each(function(){
          var $this=$(this);
          if (property<$(this).text()) {
            insertPoint=$this;
            return false;
          }
        });
        var li='<li class="collapsible visible">'+property+'</li>';
        var ul=obj2html({
          obj: options.obj[property],
          filter: options.filter,
          expand: options.expand=="recursive",
          root: path+'.'
        });
        if (insertPoint) {
          $(li).insertBefore(insertPoint);
          $(ul).insertBefore(insertPoint);
        } else {
          tree.append(li)
          tree.append(ul)
        }
        break;

      default: 
        var type=options.obj[property].match(/^[0-9\.\-]+$/)?'number':'text';
        var li='<li class="visible"><label for="'+path+'">'+property+'</label><input id="'+path+'" type="'+type+'" value="'+options.obj[property]+'">';
        var insertPoint=null;
        $('li',tree).each(function(){
          var $this=$(this)
          if ($this.hasClass('collapsible') || property<$('label',this).text()) {
            insertPoint=$this;
            return false;
          }
        });
        if (insertPoint) {
          $(li).insertBefore(insertPoint);
        } else {
          tree.append(li);
        }
        break;
    }
  }

  if (options.expand!="true" && options.expand!="recursive") {
    $('.collapsible',tree).each(function(){
      $(this).next().hide();
      $(this).addClass('collapsed');
    });
  }

  return tree;
}

var filterTimeout;
function filterList(e) {
  if (filterTimeout){
    clearTimeout(filterTimeout);
  }
  filterTimeout=setTimeout(function(){
    var input=$(e.target)
    var str=input.val();
    if (str!=input.data('prev')){
      var regexp=new RegExp(str,"i");
      $('#config li:not(.collapsible)').each(function(i,li){
        li=$(li);
        var id=$('input',li)[0].id.replace(/^([^\.]+\.)+/,'');
        if (id.match(regexp)) {
          li.addClass('visible');
        } else {
          li.removeClass('visible');
        }

        while(true) {
        /* (un)collapse (not) empty parent */ 
          var ul=li.parent();
          var header=ul.prev();
          if (header.text()=="cameraIPs") {
            var yo=true;
          }
          // TODO: do not collapse top header included from url (&include=)
          // TODO: reset collapsed status (use another class for collapsing with search ?) after search (when search input is cleared ie str="")
          if (!header.length) break;
          if ($('.visible:not(.collapsible)',ul).length) {
            if (header.hasClass('collapsed')||!header.hasClass('visible')) {
              ul.show();
              header.removeClass('collapsed').addClass('visible');
            }
          } else {
            if ((!header.hasClass('collapsed'))||header.hasClass('visible')) {
              ul.hide();
              header.addClass('collapsed').removeClass('visible');
            }
          }
          li=header;
        }
      });
    }
  },200);
}

