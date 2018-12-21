/**
 * @file  component BreadCrumb
 * @author sqliang(hfutsqliang@gmail.com)
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import Icon from '../Icon';
import BreadCrumbItem from './BreadCrumbItem';
import {
    BREAD_CRUMB_ITEM_INIT,
    BREAD_CRUMB_ITEM_DETACHED,
    BREAD_CRUMB_ITEM_CLICK
} from './constant';

const cx = create('breadcrumb');
const iconMap = {
    separator: 'angle-right-small'
};
export default class BreadCrumb extends Component {
    // 为了兼容之前的实现方式，这里将BreadCrumbItem的ComponentClass作为静态属性
    static Item = BreadCrumbItem;

    static template = `
        <ol class="{{wrapClasses}}">
            <template s-if="hasNoNameSlots">
                <slot></slot>
            </template>
            <template s-else>
                <ui-breadcrumb-item s-for="route, index in routes"
                    to="{{route.to}}"
                    type="{{route.type}}"
                    native="{{route.native}}"
                    on-redirect="fireRedirect($event, route, index)">
                    <slot name="label" var-route="route">{{route.label || route.text}}</slot>
                    <template slot="separator">
                        <slot name="separator"><ui-icon name="${iconMap.separator}"></ui-icon></slot>
                    </template>
                </ui-breadcrumb-item>
            </template>
        </ol>
    `;

    static trimWhitespace = 'all';

    static dataTypes = {
        // 自定义分隔符,默认为 '>'
        separator: DataTypes.string
    };

    static components = {
        'ui-breadcrumb-item': BreadCrumbItem,
        'ui-icon': Icon
    };

    initData() {
        return {
            separator: '>'
        };
    }

    static messages = {
        [BREAD_CRUMB_ITEM_INIT](e) {
            let item = e.target;
            this.items.push(item);
            item.data.set('separator', this.data.get('separator'));
        },
        [BREAD_CRUMB_ITEM_DETACHED](e) {
            this.items = this.items.filter(item => item !== e.target);
        },
        [BREAD_CRUMB_ITEM_CLICK]({value, target}) {
            this.fire('redirect', {
                event: value,
                item: target
            });
        }

    };

    static computed = {
        wrapClasses() {
            return cx(this).build();
        }
    };

    inited() {
        this.items = [];
    }

    attached() {
        let slotSep = this.slot('separator');
        let slotLabel = this.slot('label');
        if (slotSep && slotSep.length || slotLabel && slotLabel.length) {
            this.data.set('hasNoNameSlots', false);
        }
        else {
            this.data.set('hasNoNameSlots', true);
        }
        this.checkRoutes();
        this.watch('routes', val => {
            this.checkRoutes();
        });
    }

    checkRoutes() {
        let routes = this.data.get('routes');
        if (!routes || !routes.length) {
            return;
        }
        let len = routes.length;
        const last = routes[len - 1];
        if (!last.type) {
            this.data.set(`routes[${len - 1}].type`, 'text');
        }
    }

    fireRedirect(event, route, index) {
        this.fire('redirect', {event, route, index});
    }
}
