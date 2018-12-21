/**
 * @file component Link
 * @author liuchaofan(asd123freedom@gmail.com)
 */

import {Component, DataTypes} from 'san';
import classnames from 'classnames';
import {create} from '../../util/cx';
import {Link as Linker} from 'san-router';

const cx = create('link');

export default class Link extends Component {
    static template = `
        <template style="{{computedStyle}}">
            <span s-if="!to && fallback ==='span'"
                prop-ui="{{ui}}"
                class="{{computedClass}}"
                on-click="handleRedirect"><slot/>
            </span>
            <div s-if="!to && fallback ==='div'"
                prop-ui="ui"
                class="{{computedClass}}"
                on-click="handleRedirect"><slot/>
            </div>
            <ui-linker s-else-if="to && !native"
                to="{{to}}"
                class="{{computedClass}} 123"
                prop-ui="{{ui}}">
                <slot/>
            </ui-linker>
            <a s-else
                prop-href="{{to}}"
                prop-ui="{{ui}}"
                class="{{computedClass}} 456"
                on-click="handleRedirect">
                <slot/>
            </a>
        </template>
    `;

    static components = {
        'ui-linker': Linker
    };

    static computed = {
        computedClass() {
            let disabled = this.data.get('disabled');
            return classnames({
                [cx(this).build()]: true,
                'dux-disabled': !!disabled
            });
        },
        computedStyle() {
            let fallback = this.data.get('fallback');
            if (fallback === 'div') {
                return 'display: block';
            }
            return 'display: inline-block';
        }
    }

    static dataTypes = {
        // 是否使用原生跳转
        native: DataTypes.bool,
        // 路由跳转是否向history添加新记录
        replace: DataTypes.bool
    };


    handleRedirect(event) {
        let disabled = this.data.get('disabled');
        let to = this.data.get('to');
        let replace = this.data.get('replace');
        if (disabled) {
            event.preventDefault();
            return;
        }
        if (to) {
            this.fire('change', event);
            if (replace && !event.defaultPrevented) {
                event.preventDefault();
                location.replace(to);
            }
        }
        else {
            event.preventDefault();
            this.fire('change', event);
        }
    }
}

export class SpanFallBackFromLink extends Link {
    static tempalte = `
        <span
            prop-ui="{{ui}}"
            class="{{computedClass}}"
            on-click="handleRedirect"><slot/>
        </span>
    `;
}

export class DivFallBackFromLink extends Link {
    static template = `
        <div
            prop-ui="ui"
            class="{{computedClass}}"
            on-click="handleRedirect"><slot/>
        </div>
    `;
}

/*
export class RouterLink extends Link {
    static template = `
    <template>
        <ui-linker
            to="{{to}}"
            class="{{computedClass}} router"
            prop-ui="{{ui}}">
            <slot/>
        </ui-linker>
    </template>
    `;
}
*/

export class NativeLink extends Link {
    static template = `
        <a
            prop-href="{{to}}"
            prop-ui="{{ui}}"
            class="{{computedClass}} native"
            on-click="handleRedirect">
            <slot/>
        </a>
    `;
}
