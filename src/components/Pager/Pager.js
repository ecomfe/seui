/**
 * @file component Pager
 * @author sqliang (hfutsqliang@gmail.com)
 */

import {Component, DataTypes} from 'san';
import classnames from 'classnames';
import {create} from '../../util/cx';

import Icon from '../Icon/Base';
import Select from '../Select/';
import Button from '../Button';

const cx = create('pager');

export default class Pager extends Component {
    static template = `
        <div class="{{wrapClasses}}" ui="{{ui}}">
            <span s-if="showTotalUI" class="${cx.getPartClassName('total')}">
                <slot name="total">共 {{total}} 条</slot>
            </span>
            <span s-if="showSizeChangerUI" class="${cx.getPartClassName('size')}">
                <span>每页条数</span>
                <ui-select
                    ui="{{size}}"
                    options="{{realPageSizeOpts}}"
                    value="{=pageSize=}"
                    on-change="handleSelectChange($event)" />
            </span>
            <div class="${cx.getPartClassName('switch')}">
                <span
                    s-if="!isHetero"
                    class="{{prevClasses}}"
                    on-click="handlePrev($event)">
                    <slot name="prev">
                        <ui-button s-if="prevPageText"
                            ui="{{size}}"
                            disabled="{{currentPage === 1}}">{{prevPageText}}</ui-button>
                        <ui-button s-else ui="square {{size}}" disabled="{{currentPage === 1}}">
                            <ui-icon name="angle-left-large"></ui-icon>
                        </ui-button>
                    </slot>
                </span>
                <span class="{{firstPageClasses}}" on-click="changePage(1, $event)">1</span>
                <span
                    class="${cx.getPartClassName('item-jump-buttons')}"
                    s-if="currentPage - 3 > 1"
                    on-click="fastPrev($event)">...</span>
                <span
                    class="${cx.getPartClassName('item')}"
                    s-if="currentPage -2 > 1"
                    on-click="changePage(currentPage - 2, $event)">
                    {{currentPage - 2}}
                </span>
                <span
                    class="${cx.getPartClassName('item')}"
                    s-if="currentPage -1 > 1"
                    on-click="changePage(currentPage -1, $event)">
                    {{currentPage - 1}}
                </span>
                <span
                    class="{{currentPageClasses}}"
                    s-if="currentPage != 1 && currentPage != allPages">
                    {{currentPage}}
                </span>
                <span
                    class="${cx.getPartClassName('item')}"
                    s-if="currentPage + 1 < allPages"
                    on-click="changePage(currentPage + 1, $event)">
                    {{currentPage + 1}}
                </span>
                <span
                    class="${cx.getPartClassName('item')}"
                    s-if="currentPage + 2 < allPages"
                    on-click="changePage(currentPage + 2, $event)">
                    {{currentPage + 2}}
                </span>
                <span
                    class="${cx.getPartClassName('item-jump-buttons')}"
                    s-if="currentPage + 3 < allPages"
                    on-click="fastNext($event)">...</span>
                <span
                    class="{{lastPageClasses}}"
                    s-if="allPages > 1"
                    on-click="changePage(allPages, $event)">
                    {{allPages}}
                </span>
                <span
                    s-if="isHetero"
                    class="{{prevClasses}}"
                    on-click="handlePrev($event)">
                    <slot name="prev">
                        <ui-button s-if="prevPageText"
                            ui="{{size}}"
                            disabled="{{currentPage === 1}}">{{prevPageText}}</ui-button>
                        <ui-button s-else ui="square {{size}}" disabled="{{currentPage === 1}}">
                            <ui-icon name="angle-left-large"></ui-icon>
                        </ui-button>
                    </slot>
                </span>
                <span
                    class="{{nextClasses}}"
                    on-click="handleNext($event)">
                    <slot name="next">
                        <ui-button s-if="nextPageText"
                            ui="{{size}}"
                            disabled="{{currentPage === allPages}}">{{nextPageText}}</ui-button>
                        <ui-button s-else ui="square {{size}}" disabled="{{currentPage === allPages}}">
                            <ui-icon name="angle-right-large"></ui-icon>
                        </ui-button>
                    </slot>
                </span>
            </div>
        </div>
    `;

    static dataTypes = {
        // 当前页码 默认值为 1
        page: DataTypes.number,
        // 数据总数 默认值为 0
        total: DataTypes.number,
        // 每页条数 默认值为10
        pageSize: DataTypes.number,
        // 每页条数切换的配置, 默认值为[10,20,30,40]
        pageSizes: DataTypes.array,
        // 显示总条数 默认值为 false
        showTotal: DataTypes.bool,
        // 显示分页切换配置, 用来改变page-size
        showSizeChanger: DataTypes.bool,
        // 上一页按钮的文本
        prevPageText: DataTypes.string,
        // 下一页按钮的文本
        nextPageText: DataTypes.string,
        // 上下页按钮显示模式
        // normal(分页按钮在两边)
        // hetero(分页按钮在右边)
        // micro(微型)
        // full(带条数和页数)
        ui: DataTypes.oneOf(['normal', 'hetero', 'micro', 'full']) // oneOf(['normal', 'hetero'])
    };

    initData() {
        return {
            page: 1,
            total: 0,
            pageSize: 10,
            pageSizes: [10, 20, 30, 40],
            showSizeChanger: false,
            showTotal: false,
            prevPageText: '',
            nextPageText: '',
            ui: 'normal'
        };
    }

    static components = {
        'ui-icon': Icon,
        'ui-select': Select,
        'ui-button': Button
    };

    static computed = {
        size() {
            let ui = this.data.get('ui') || '';
            return ui.indexOf('micro') > -1 ? 'micro' : 'small';
        },
        isHetero() {
            let ui = this.data.get('ui');
            return ['hetero', 'full'].indexOf(ui) > -1;
        },
        showTotalUI() {
            const showTotal = this.data.get('showTotal');
            const ui = this.data.get('ui');
            return ui === 'full' || showTotal;
        },
        showSizeChangerUI() {
            const showSizeChanger = this.data.get('showSizeChanger');
            const ui = this.data.get('ui');
            return ui === 'full' || showSizeChanger;
        },
        lastPageClasses() {
            let currentPage = this.data.get('currentPage');
            let allPages = this.data.get('allPages');

            return classnames(
                cx.getPartClassName('item'),
                {
                    [cx.getPartClassName('item-active')]: currentPage === allPages
                }
            );
        },
        currentPageClasses() {
            return classnames(
                cx.getPartClassName('item'),
                cx.getPartClassName('item-active')
            );
        },
        firstPageClasses() {
            let currentPage = this.data.get('currentPage');
            return classnames(
                cx.getPartClassName('item'),
                {
                    [cx.getPartClassName('item-active')]: currentPage === 1
                }
            );
        },
        allPages() {
            let total = this.data.get('total');
            let currentPageSize = this.data.get('currentPageSize');
            let allPage = Math.ceil(total / currentPageSize);
            return allPage === 0 ? 1 : allPage;
        },
        prevClasses() {
            return cx.getPartClassName('buttons-prev');
        },
        nextClasses() {
            return cx.getPartClassName('buttons-next');
        },
        realPageSizeOpts() {
            let pageSizeOpts = this.data.get('pageSizes');
            return pageSizeOpts.map(size => ({
                label: size,
                value: size
            }));
        },
        wrapClasses() {
            return cx(this).build();
        }
    };

    attached() {
        let current = this.data.get('page');
        let pageSize = this.data.get('pageSize');
        let total = this.data.get('total');
        let maxPage = Math.ceil(total / pageSize);
        this.data.set('currentPageSize', pageSize);

        const currentPage = maxPage > 0 && maxPage < current
            ? maxPage
            : current;
        this.data.set('currentPage', currentPage);

        this.watch('total', val => {
            let allPages = this.data.get('allPages');
            let currentPageSize = this.data.get('currentPageSize');

            if (allPages > 0 && allPages < currentPageSize) {
                this.data.set('currentPage', maxPage);
            }
        });

        this.watch('page', val => {
            this.data.set('currentPage', val);
        });

        this.watch('currentPage', val => {
            let allPages = this.data.get('allPages');

            const currentPage = allPages > 0 && allPages < val
                ? allPages
                : val;
            this.data.set('currentPage', currentPage);
        });

        this.watch('pageSize', val => {
            this.data.set('currentPageSize', val);
        });
    }

    handlePrev(event) {
        let currentPage = this.data.get('currentPage');
        if (currentPage <= 1) {
            return false;
        }
        this.changePage(currentPage - 1, event);
    }
    handleNext(event) {
        let currentPage = this.data.get('currentPage');
        let allPages = this.data.get('allPages');
        if (currentPage >= allPages) {
            return false;
        }
        this.changePage(currentPage + 1, event);
    }
    fastPrev(event) {
        let page = this.data.get('currentPage') - 5;
        this.changePage(page > 0 ? page : 1, event);
    }

    fastNext(event) {
        let page = this.data.get('currentPage') + 5;
        let allPages = this.data.get('allPages');
        this.changePage(page > allPages ? allPages : page, event);
    }

    changePage(page, event) {
        this.data.set('currentPage', page);
        this.fire('redirect', {page, event});
    }

    handleSelectChange(pageSize) {
        let oldPageSize = this.data.get('currentPageSize');
        let oldCurrent = this.data.get('currentPage');
        this.data.set('currentPageSize', pageSize);
        this.data.set('currentPage', 1);

        this.fire('pagesizechange', pageSize);
    }
}
