<?php
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
 * This file : saveconfig.php
 * Author(s) : Luc Deschenaux <l.deschenaux@foxel.ch> 
 *
 */

$config=json_decode($_POST['config'],true);

function toXML($options,$root) {
  $xml='';
  $path=(strlen($root)?$root.'.':'');
  foreach ($options as $key => $value) {
    switch(gettype($value)) {
    case 'array':
      $xml.=toXML($value,$path.$key);
      break;
    default:
      $xml.='<entry key="'.$path.$key.'">'.$value."</entry>\n";
      break;
    }
  }
  return $xml;
}  

$timestamp=microtime(true)*10000;
$f=fopen("/tmp/config_".$timestamp.".xml","w");

fwrite($f,'
<?xml version="1.0" encoding="UTF-8" standalone="no"?>                                                                                      
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <comment>last updated '.date('r').'</comment>
'
);

fwrite($f,toXML($config,''));
fwrite($f,'</properties>');
fclose($f);

header('Content-Type: application/json');
echo '{"timestamp": "'.$timestamp.'"}';

?>
