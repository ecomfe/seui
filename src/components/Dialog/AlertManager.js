/**
 * @file 负责弹出带有特殊信息的框
 * @author liuchaofan <asd123freedom@gmail.com>
 */
import Dialog from './SpecialDialog';

class AlertManager {
    constructor() {
        this.init();
    }
    // 将实例attach到body
    init() {
        this.component = new Dialog();
        this.component.attach(document.body);
    }
    // 销毁
    destroy() {
        this.component && this.component.dispose();
    }
    // 关闭消息
    show(title, content, type, callback) {
        let cb = () => {
            callback && callback(this.component);
            this.component.un('ok');
        };
        this.component.data.set('type', type);
        this.component.on('ok', cb);
        return this.component.open(title, content);
    }
    success(title, content, callback) {
        this.show(title, content, 'success', callback);
    }
    info(title, content, callback) {
        this.show(title, content, 'info', callback);
    }
    error(title, content, callback) {
        this.show(title, content, 'error', callback);
    }
}
export default new AlertManager();
