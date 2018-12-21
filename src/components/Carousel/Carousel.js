/**
 * @file Carousel
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import Icon from '../Icon';

const cx = create('carousel');


export default class Carousel extends Component {

    static template = `
        <div class="{{computedClassName}}" prop-ui="{{ui}}">
            <div
                class="${cx.getPartClassName('viewport')}"
                on-mouseenter="handleMouseEnter"
                on-mouseleave="handleMouseLeave">
                <ol
                    class="${cx.getPartClassName('items')}">
                    <template san-for="item, indexNum in datasource">
                        <li
                            san-if="index === indexNum"
                            class="${cx.getPartClassName('item')}
                                {{index === indexNum?'${cx.getPartClassName('item-current')}':''}}"
                            style="background-image: url('{{item.src}}')"
                            san-transition="opacityTrans(noTransition)">
                            <slot var-item="{{item}}" var-index="{{indexNum}}">
                                <img src="{{item.src}}" alt="{{item.alt}}">
                            </slot>
                        </li>
                    </template>
                </ol>
                <button
                    type="button"
                    class="${cx.getPartClassName('control')} ${cx.getPartClassName('control-prev')}"
                    on-click="step(-1)"
                    disabled="{{!wrap && index === 0}}">
                    <ui-icon name="angle-left"></ui-icon>
                </button>
                <button
                    type="button"
                    class="${cx.getPartClassName('control')} ${cx.getPartClassName('control-next')}"
                    on-click="step(1)"
                    disabled="{{!wrap && index === count - 1}}">
                    <ui-icon name="angle-right"></ui-icon>
                </button>
                <div san-if="indicator === 'number'" class="${cx.getPartClassName('indicator-numbers')}">
                    {{index + 1}}
                    <span class="${cx.getPartClassName('indicator-numbers-separator')}"></span>
                    {{count}}
                </div>
                <nav san-if="indicator === 'radio'"
                    class="${cx.getPartClassName('indicator')}-{{indicator}}s">
                    <button
                        type="button"
                        san-for="item, indexNum in datasource"
                        class="{{indexNum===index ? '${cx.getPartClassName('indicator-item-current')}' : ''}}
                            ${cx.getPartClassName('indicator-item')}"
                        on-click="select(indexNum, 'click')"
                        on-mouseenter="select(indexNum, 'hover')">
                    </button>
                </nav>
                <nav san-if="indicator === 'tab'"
                    class="${cx.getPartClassName('indicator')}-{{indicator}}s">
                    <button
                        type="button"
                        san-for="item, indexNum in datasource"
                        class="{{indexNum===index ? '${cx.getPartClassName('indicator-item-current')}' : ''}}
                            ${cx.getPartClassName('indicator-item')}"
                        on-click="select(indexNum, 'click')"
                        on-mouseenter="select(indexNum, 'hover')">
                        第 {{indexNum+1}} 页
                    </button>
                </nav>
            </div>
        </div>
    `;

    static components = {
        'ui-icon': Icon
    };

    static computed = {
        computedClassName() {
            return cx(this).build();
        },
        count() {
            return this.data.get('datasource').length || 0;
        }
    };

    static dataTypes = {
        ui: DataTypes.string,
        index: DataTypes.number,
        interval: DataTypes.number,
        autoplay: DataTypes.bool,
        wrap: DataTypes.bool,
        pauseOnHover: DataTypes.bool,
        switchTrigger: DataTypes.string,
        indicator: DataTypes.string
    };

    initData() {
        return {
            index: 0,
            interval: 3000,
            ui: '',
            autoplay: true,
            wrap: true,
            pauseOnHover: true,
            switchTrigger: 'hover',
            indicator: 'radio'
        };
    }
    attached() {
        this.initPlay();
        this.watch('interval', () => {
            this.initPlay();
        });
        this.watch('autoplay', () => {
            this.initPlay();
        });
    }

    initPlay() {
        this.stop();
        if (!this.data.get('autoplay')) {
            return;
        }
        this.timer = setInterval(() => {
            this.step(1);
        }, this.data.get('interval'));
    }

    select(index, event) {
        if (event !== this.data.get('switchTrigger')) {
            return;
        }
        this.data.set('index', index);
    }

    handleMouseEnter() {
        if (this.data.get('pauseOnHover')) {
            this.stop();
        }
    }

    handleMouseLeave() {
        if (this.data.get('pauseOnHover')) {
            this.initPlay();
        }
    }

    step(delta) {
        let {index, count} = this.data.get();
        let localIndex = (index + delta + count) % count;
        this.data.set('index', localIndex);
        this.fire('change', {toIndex: localIndex, fromIndex: index});
    }

    stop() {
        clearInterval(this.timer);
    }

    disposed() {
        this.stop();
    }

    opacityTrans(disabled) {
        return {
            enter(el, done) {
                if (disabled) {
                    done();
                    return;
                }

                let steps = 20;
                let currentStep = 0;

                function goStep() {
                    if (currentStep >= steps) {
                        el.style.opacity = 1;
                        done();
                        return;
                    }

                    el.style.opacity = 1 / steps * currentStep++;
                    requestAnimationFrame(goStep);
                }

                goStep();
            },

            leave(el, done) {
                if (disabled) {
                    done();
                    return;
                }

                let steps = 20;
                let currentStep = 0;

                function goStep() {
                    if (currentStep >= steps) {
                        el.style.opacity = 0;
                        done();
                        return;
                    }

                    el.style.opacity = 1 - 1 / steps * currentStep++;
                    requestAnimationFrame(goStep);
                }

                goStep();
            }
        };
    }

}
