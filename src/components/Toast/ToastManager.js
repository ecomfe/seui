/**
 * @file ToastManager
 */

import ToastList from './ToastList';

const Container = ToastList;

class ToastManager {

    constructor() {
        this.container = new Container();
        this.init();
    }

    // 将实例attach到body
    init() {
        this.container.attach(document.body);
    }

    // 销毁
    destroy() {
        if (this.container) {
            this.container.dispose();
        }
    }

    // 调用this.container的add
    add(option) {
        if (!this.el) {
            this.init();
        }

        if (Array.isArray(option)) {
            option.forEach(item => {
                return this.container.add(item);
            });
        }
        else if (typeof option === 'object') {
            return this.container.add(option);
        }
        else {
            // throw an error here
            console.log('Invalid arguments for Toasts.');
        }
    }

    // 关闭消息
    close(message) {
        try {
            this.container.remove(message);
        } catch (e) {
            console.log('error', e);
        }
    }

    _show(message, type) {
        let option = message;
        if (typeof message === 'string') {
            option = {
                message
            };
        }
        option.type = type;

        return this.add(option);
    }


    success(message) {
        return this._show(message, 'success');
    }

    warn(message) {
        return this._show(message, 'warning');
    }

    info(message) {
        return this._show(message, 'info');
    }

    error(message) {
        return this._show(message, 'error');
    }
}

export default new ToastManager();