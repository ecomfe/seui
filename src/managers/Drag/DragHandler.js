/**
 * @file 用translate和Html5的drag API处理拖拽需求
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import TranslateHandler from './TranslateHandler';

export default class DragHandler {
    constructor(context, {containment = window, axis}) {
        this.context = context;
        this.draggable = true;
        this.dragData = {
            initX: 0,
            initY: 0
        };
        this.handler = new TranslateHandler();
        this.handler.setOptions({containment, axis});
        this.handler.elms = [context.el];
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
    }

    init() {
        this.context.el.addEventListener('mousedown', this.mouseDownHandler);
    }

    reset() {
        this.handler.reset();
    }

    destroy() {
        this.draggable = false;
        this.context.el.removeEventListener('mousedown', this.mouseDownHandler);
        this.context = null;
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        window.removeEventListener('mouseup', this.mouseupHandler);
        window.removeEventListener('selectstart', this.selectStartHandler);
    }

    selectStartHandler(e) {
        e.preventDefault();
    }

    mouseDownHandler(event) {
        if (!this.draggable || this.dragging) {
            return;
        }

        let {clientX, clientY} = event;
        this.dragging = true;
        this.dragData.initX = clientX;
        this.dragData.initY = clientY;
        this.context.fire('dragstart', {event});
        this.handler.start({event});
        this.dragstart && this.dragstart({event});
        // TODO: 非IE下面不用移除选区
        document.getSelection().removeAllRanges();
        window.addEventListener('selectstart', this.selectStartHandler);

        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);

    }

    mouseMoveHandler(event) {
        let {clientX, clientY} = event;
        if (!this.dragging) {
            return;
        }

        let dragParams = {
            distanceX: clientX - this.dragData.initX,
            distanceY: clientY - this.dragData.initY,
            event
        };
        this.context.fire('drag', dragParams);
        this.handler.drag(dragParams);
        this.drag && this.drag(dragParams);
    }

    mouseUpHandler(event) {
        this.dragging = false;

        let {clientX, clientY} = event;

        let dragParams = {
            distanceX: clientX - this.dragData.initX,
            distanceY: clientY - this.dragData.initY,
            event
        };
        this.context.fire('dragend', dragParams);
        this.handler.end(dragParams);
        this.dragend && this.dragend(dragParams);

        window.removeEventListener('mousemove', this.mouseMoveHandler);
        window.removeEventListener('mouseup', this.mouseUpHandler);
        window.removeEventListener('selectstart', this.selectStartHandler);
    }
}
