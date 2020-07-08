import { Pipe, PipeTransform } from '@angular/core';
// import {DomSanitizer,SafeResourceUrl} from '@angular/platform-browser';

@Pipe({
  name: 'pluginInstance'
})
export class PluginInstancePipe implements PipeTransform {
  // constructor(protected sanitizer:DomSanitizer){}
  // sanitizer = new DomSanitizer()

  transform(detectedPlugins) {
    console.log("PIPE######:",detectedPlugins)
    let singleInstancePlugins = []
    if(detectedPlugins){
      detectedPlugins.forEach(plugin => {
        if(plugin && (plugin.Instances && parseInt(plugin.Instances) === 1) && (plugin.ServicesEnabled === true)){
/*           let iconUrl:SafeResourceUrl = plugin.IconUrl ? this.getTrustUrl(plugin.IconUrl) : ''
          iconUrl ? plugin.IconUrl = iconUrl : plugin.IconUrl = '' */
          singleInstancePlugins.push(plugin)
        }
      });
      return singleInstancePlugins
    }
  }

}
