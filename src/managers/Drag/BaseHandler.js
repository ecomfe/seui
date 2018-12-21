/**
 * @file BaseHandle for drag a component(暂时看不出什么作用，参考veui)
 * @author liuchaofan <asd123freedom@gmail.com>
 */

export default class BaseHandler {

    options = {};

    context = null;

    isDragging = false;

    constructor(options, context) {
        this.setOptions(options);
        this.context = context;
    }

    start() {
        this.isDragging = true;
    }

    drag() {}

    end() {
        this.isDragging = false;
    }

    destroy() {}

    setOptions(options) {
        if (this.isDragging) {
            throw new Error('Do not set `options` while dragging.');
        }
        this.options = options;
    }

    reset() {}
}
