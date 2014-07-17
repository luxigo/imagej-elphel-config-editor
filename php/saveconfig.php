<?php
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
