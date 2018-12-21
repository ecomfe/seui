/**
 * @file read icon config inspired by https://github.com/Justineo/vue-awesome
 * @author liuchaofan
 */

import config from '../../assets/icons';
let icons = {};
function register(data) {
    for (let name in data) {
        let icon = data[name];
        if (!icon.paths) {
            icon.paths = [];
        }
        if (icon.d) {
            icon.paths.push({d: icon.d});
        }
        if (!icon.polygons) {
            icon.polygons = [];
        }
        if (icon.points) {
            icon.polygons.push({points: icon.points});
        }
        icons[name] = icon;
    }
}
register(config);
export default function (name) {
    return icons[name];
}
