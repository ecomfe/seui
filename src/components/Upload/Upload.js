/**
 * @file 上传组件
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import Tooltip from '../Tooltip';
import ProgressBar from './ProgressBar';
import bytes from 'bytes';
import {
    isArray,
    isString,
    assign,
    isEmpty,
    omit,
    pick,
    cloneDeep,
    last,
    uniqueId
} from 'lodash';
const cx = create('uploader');

let uploadConfig = {
    requestMode: 'xhr',
    iframeMode: 'postmessage',
    callbackNamespace: 'duxUploadResult'
};

/* eslint-disable max-len */

export default class Alert extends Component {
    static template = `
        <div prop-ui="{{ui}}" class="{{computedClass}}" s-ref="main">
            <div class="${cx.getPartClassName('button-container')}" s-if="type === 'file'">
                <label class="{{labelClass}}" on-click="handleClick" s-ref="label">
                    <slot name="button-label"><ui-icon class="{{labelIconClass}}" name="{{icons.upload}}"/>选择文件</slot>
                    <input s-ref="input" 
                        prop-hidden="hidden"
                        type="file"
                        proo-id="{{inputId}}"
                        name="{{name}}"
                        on-change="handleNewFiles"
                        disabled="{{inputDisabled}}"
                        accept="{{accept}}"
                        multiple="{{localMultiple}}"
                    />
                </label>
                <span s-if="namedSlots && namedSlots.desc" class="${cx.getPartClassName('tip')}">
                    <slot name="desc"></slot>
                </span>
                <span class="${cx.getPartClassName('error')}">
                    <template s-if="error.typeInvalid">
                        <slot name="type-invalid"><ui-icon name="{{icons.alert}}"/>文件的类型不符合要求</slot>
                    </template>
                    <template s-if="error.sizeInvalid">
                        <slot name="size-invalid"><ui-icon name="{{icons.alert}}"/>文件的大小不符合要求</slot>
                    </template>
                    <template s-if="error.countOverflow">
                        <slot name="count-overflow"><ui-icon name="{{icons.alert}}"/>文件的数量超过限制</slot>
                    </template>
                </span>
            </div>
            <ul class="{{listClass}}">
                <li s-for="item, index in fileList" s-transition="transition('transition-list', 300)">
                    <template s-if="(type === 'file' && item.status !== 'uploading')
                        || type === 'image' && (!item.status || item.status === 'success')">
                        <slot name="file" var-file="item" var-index="index">
                            <template s-if="type === 'file'">
                                <slot name="file-before" var-file="item" var-index="index"></slot>
                                <div class="${cx.getPartClassName('list-container')}">
                                    <ui-icon name="{{icons.file}}" class="${cx.getPartClassName('list-icon')}"/>
                                    <span class="{{item | getListNameClass}}" title="{{item.name}}">{{item.name}}</span>
                                    <span s-if="item.status === 'success'"
                                        class="${cx.getPartClassName('success')}">
                                        <slot name="success-label">上传成功</slot>
                                    </span>
                                    <span s-if="item.status === 'failure'"
                                        class="${cx.getPartClassName('failure')}"
                                        s-ref="fileFailure-{{index}}">
                                        <slot name="failure-label">上传失败</slot>
                                    </span>
                                    <ui-button s-if="file.status === 'failure'" ui="link"
                                        on-click="retry(item)" class="{{listClass + '-retry'}}">
                                        <ui-icon name="{{icons.redo}}"/>重试
                                    </ui-button>
                                    <ui-button class="${cx.getPartClassName('button-remove')}" ui="link"
                                        on-click="removeFile(item, index)"
                                        disabled="{{realUneditable}}">
                                        <ui-icon name="{{icons.clear}}"/>
                                    </ui-button>
                                    <!--ui-tooltip position="{{'top'}}">{{file.failureReason}}</ui-tooltip-->
                                </div>
                                <slot name="file-after" var-file="item" var-index="index"></slot>
                            </template>
                            <template s-else>
                                <slot name="file-before" var-file="item" var-index="index"></slot>
                                <div class="{{listClass + '-container'}}">
                                    <img src="{{item.src}}" alt="{{item.alt || ''}}"/>
                                    <div s-if="!realUneditable" class="{{listClass + '-mask'}}">
                                        <label prop-for="{{inputId}}"
                                            class="{{labelImageListClass}}"
                                            on-click="replaceFile($event, item)">重新上传</label>
                                        <ui-button
                                            on-click="removeFile(file)"
                                            class="{{listClass + '-mask-remove'}}"
                                            disabled="{{realUnediable}}">
                                            <ui-icon name="{{icons.clear}}"/>
                                        </ui-button>
                                        <slot name="extra-operation" var-file="item" var-index="index"></slot>
                                    </div>
                                    <div s-if="file.status === 'success'"
                                        s-transition="transition('uploader-fade')"
                                        class="{{listClass + '-success'}}">
                                        <span class="${cx.getPartClassName('success')}">
                                            <slot name="success-label">
                                                <ui-icon name="icons.success">完成</ui-icon>
                                            </slot>
                                        </span>
                                    </div>
                                </div>
                                <slot name="file-after" var-file="item" var-index="index"></slot>
                            </template>
                        </slot>
                    </template>
                    <template s-else-if="item.status === 'uploading'">
                        <slot name="uploading" var-file="item" var-index="index">
                            <slot name="file-before" var-file="item" var-index="index"/>
                            <div class="{{listClass + '-container'}}">
                                <ui-uploader-progress 
                                    type="{{progress}}"
                                    loaded="{{item.loaded}}"
                                    total="{{item.total}}"
                                    class="{{type === 'image' ? listClass + '-status' : ''}}">
                                    <slot name="uploading-label">上传中...</slot>
                                </ui-uploader-progress>
                                <ui-button s-if="type === 'file'" ui="link"
                                    class="${cx.getPartClassName('button-remove')}"
                                    on-click="cancelFile(item)"><ui-icon name="{{icons.clear}}"/></ui-button>
                                <ui-button s-else ui="aux operation"
                                    on-click="cancelFile(item)">取消</ui-button>
                            </div>
                            <slot name="file-after" var-file="item" var-index="index"/>
                        </slot>
                    </template>
                    <template s-else-if="item.status === 'failure' && type === 'image'">
                        <slot name="failure" var-file="item" var-index="index">
                            <slot name="file-before" var-file="item" var-index="index"/>
                            <div class="{{listClass + '-container'}}">
                                <div class="{{listClass + '-status'}}">
                                    <span class="${cx.getPartClassName('failure')}">
                                        <slot name="failure-label">错误！</slot>
                                    {{item.failureReason}}</span>
                                </div>
                                <ui-button ui="aux operation" on-click="retry(item)">重试</ui-button>
                                <ui-button ui="link" on-click="removeFile(item)"
                                    class="{{listClass + '-mask-remove ' + liastClass + '-remove-failure'}}">
                                    <ui-icon name="{{icons.clear}}"/>移除</ui-button>
                            </div>
                            <slot name="file-after" var-file="item" var-index="index"/>
                        </slot>
                    </template>
                </li>
                <li s-if="type === 'image'"
                    class="{{!maxCount || fileList.length < maxCount ? '' : '${cx.getPartClassName('list-item')} hide'}}">
                    <div class="${cx.getPartClassName('list-image-container')}">
                        <label class="{{labelImageClass}}" on-click="handleClick" s-ref="label">
                            <input s-ref="input"
                                prop-id="{{inputId}}"
                                prop-hidden="hidden" 
                                type="file"
                                name="{{name}}"
                                on-change="handleNewFiles"
                                disabled="{{realUneditable}}"
                                accept="{{accept}}"
                                on-click="stopEvent"
                                multiple="{{localMultiple}}"/>
                            <ui-icon s-if="!namedSlots['extra-operation']" name="{{icons.add}}"></ui-icon>
                            <template s-else>
                                <slot name="button-label">选择文件</slot>
                            </template>
                        </label>
                        <slot name="extra-operation"/>
                    </div>
                </li>
            </ul>
            <span class="${cx.getPartClassName('tip')}" s-if="namedSlots && namedSlots.desc && type === 'image'">
                <slot name="desc"/>
            </span>
            <span class="${cx.getPartClassName('error')}" s-if="type === 'image'">
                <template s-if="error.typeInvalid">
                    <slot name="type-invalid"><ui-icon name="{{icons.alert}}"/>文件的类型不符合要求</slot>
                </template>
                <template s-if="error.sizeInvalid">
                    <slot name="size-invalid"><ui-icon name="{{icons.alert}}"/>文件的大小不符合要求</slot>
                </template>
                <template s-if="error.countOverflow">
                    <slot name="count-overflow"><ui-icon name="{{icons.alert}}"/>文件的数量超过限制</slot>
                </template>
            </span>
        </div>
    `;

    static components = {
        'ui-button': Button,
        'ui-icon': Icon,
        'ui-tooltip': Tooltip,
        'ui-uploader-progress': ProgressBar
    };

    static trimWhitespace = 'all';

    static dataTypes = {
        type: DataTypes.string,
        name: DataTypes.string,
        ui: DataTypes.string,
        action: DataTypes.string,
        header: DataTypes.object,
        withCredentials: DataTypes.bool,
        dataType: DataTypes.oneOf(['json', 'text']),
        extensions: DataTypes.array,
        accept: DataTypes.string,
        maxCount: DataTypes.number,
        maxSize: DataTypes.oneOfType([
            DataTypes.string,
            DataTypes.number
        ]),
        payload: DataTypes.object,
        autoUpload: DataTypes.bool,
        upload: DataTypes.func,
        order: DataTypes.oneOf(['asc', 'desc']),
        convertResponse: DataTypes.func
    };

    static filters = {
        getListNameClass(value) {
            return classnames(
                cx.getPartClassName('list-name'),
                {
                    [cx.getPartClassName('list-name-success')]: value.status === 'success'
                },
                {
                    [cx.getPartClassName('list-name-failure')]: value.status === 'failure'
                }
            );
        }
    }

    static computed = {
        computedClass() {
            return classnames(
                cx(this).build()
            );
        },
        listClass() {
            let type = this.data.get('type');
            let classStr = type === 'image' ? 'list-image' : 'list';
            return cx.getPartClassName(classStr);
        },

        realUneditable() {
            let realDisabled = this.data.get('disabled');
            let realReadonly = this.data.get('readonly');
            return realDisabled || realReadonly;
        },

        labelClass() {
            let localDisabled = this.data.get('localDisabled') || false;
            return classnames(
                'dux-button',
                {
                    [cx.getPartClassName('input-label')]: true
                },
                {
                    [cx.getPartClassName('input-label-disabled')]: localDisabled
                }
            );
        },
        labelImageClass() {
            let realUneditable = this.data.get('realUneditable');
            let namedSlots = this.data.get('namedSlots');
            let maxCount = this.data.get('maxCount');
            let fileList = this.data.get('fileList') || [];
            let disabledWhenSubmiting = this.data.get('disabledWhenSubmiting');
            return classnames(
                {
                    'dux-button': !!namedSlots['extra-operation']
                },
                {
                    [cx.getPartClassName('input-label-image')]: !namedSlots['extra-operation']
                },
                {
                    [cx.getPartClassName('input-label-disabled')]: namedSlots['extra-operation']
                        && (realUneditable
                        || (maxCount > 1 && fileList.length >= maxCount)
                        || disabledWhenSubmiting)
                }
            );
        },
        labelImageListClass() {
            let realUneditable = this.data.get('realUneditable');
            return classnames(
                'dux-button',
                {
                    [cx.getPartClassName('input-label-disabled')]: realUneditable
                }
            );
        },
        labelIconClass() {
            return cx.getPartClassName('input-label-icon');
        },
        localDisabled() {
            let maxCount = this.data.get('maxCount');
            let fileList = this.data.get('fileList');
            let requestMode = this.data.get('requestMode');
            let disabledWhenSubmiting = this.data.get('disabledWhenSubmiting');
            let realUneditable = this.data.get('realUneditable');

            if (realUneditable) {
                return true;
            }

            if (maxCount > 1 && fileList && fileList.length >= maxCount) {
                return true;
            }

            return false;
        },
        inputDisabled() {
            let realUneditable = this.data.get('realUneditable');
            let maxCount = this.data.get('maxCount');
            let fileList = this.data.get('fileList') || [];
            return realUneditable || (maxCount > 1 && fileList.length >= maxCount);
        },
        localMultiple() {
            let requestMode = this.data.get('requestMode');
            let maxCount = this.data.get('maxCount');
            let isReplacing = this.data.get('isReplacing');
            return requestMode !== 'iframe' && (maxCount > 1 || maxCount === undefined) && !isReplacing;
        },
        latestFile() {
            let list = this.data.get('fileList') || [];
            return list[list.length - 1];
        },
        isReplacing() {
            return !!this.data.get('replacingFile');
        },
        realUnediable() {
            let realDisabled = this.data.get('realDisabled');
            let realReadonly = this.data.get('realReadonly');
            return realDisabled || realReadonly;
        },
        realAutoupload() {
            let autoUpload = this.data.get('autoUpload');
            return autoUpload;
        },
        files() {
            let fileList = this.data.get('fileList') || [];
            return fileList.map(file => {
                return {...pick(file, ['name', 'src', 'status']), ...file._extra};
            });
        },
        pureFileList() {
            let files = this.data.get('files');
            return files.filter(file => file.status === 'success' || !file.status)
                .map(file => omit(file, 'status'));
        },
        status() {
            let fileList = this.data.get('fileList') || [];
            if (!fileList.length) {
                return 'empty';
            }
            if (fileList.some(file => file.status === 'uploading')) {
                return 'uploading';
            }
            if (fileList.some(file => file.status === 'failure')) {
                return 'failure';
            }
            return 'success';
        }
    };

    initData() {
        return {
            icons: {
                upload: 'upload',
                clear: 'cross',
                success: 'check',
                redo: 'refresh',
                file: 'clip',
                add: 'plus-huge',
                alert: 'exclamation-circle-o'
            },
            name: 'file',
            type: 'file',
            headers: {},
            withCredentials: true,
            requestMode: uploadConfig.requestMode,
            autoUpload: true,
            dataType: 'json',
            order: 'asc',
            compat: 'false',
            progress: 'text',
            namedSlots: {},
            inputId: uniqueId('dux-uploader-input'),
            convertResponse: () => {}
        };
    }

    inited() {
        let namedSlots = this.givenSlots && this.givenSlots.named;
        this.data.set('namedSlots', namedSlots || {});
        let files = this.data.get('value');
        this.data.set('fileList', this.genFileList(files));
    }

    attached() {
        this.watch('value', val => {
            if (isArray(val) && !val.some(item => !!item.status)) {
                this.data.set('fileList', this.genFileList(val));
            }
            else if (val && !val.status) {
                this.data.set('fileList', this.genFileList(val));
            }
        });

        this.watch('status', val => {
            this.fire('statuschange', val);
        });
        this.watch('fileList', val => {
            let status = 'success';
            if (!val || !val.length) {
                status = 'empty';
            }

            if (val.some(file => file.status === 'uploading')) {
                status = 'uploading';
            }

            if (val.some(file => file.status === 'failure')) {
                status = 'failure';
            }

            return status;
        });
    }

    handleClick(e) {
        e.stopPropagation();
        this.data.set('replacingFile', null);
        this.reset();
    }

    genFileList(value) {
        if (!value) {
            return [];
        }

        let fileList = this.data.get('fileList');

        if (isArray(value)) {
            if (value.some(item => !!item.status)) {
                return fileList;
            }
            return value.map(file => this.getNewFile(file));
        }

        if (isString(value)) {
            return [assign(fileList ? fileList[0] : {}, {
                src: value,
                name: value
            })];
        }

        return isEmpty(value) ? [] : [this.getNewFile(value)];
    }

    getNewFile(file) {
        let newFile = {};
        let extraInfo = omit(file, ['name', 'src']);
        if (!isEmpty(extraInfo)) {
            newFile._extra = cloneDeep(extraInfo);
        }

        return assign(newFile, pick(file, ['name', 'src']));
    }

    handleNewFiles() {
        let type = this.data.get('type');
        let fileList = this.data.get('fileList');
        let replacingFile = this.data.get('replacingFile');
        let maxCount = this.data.get('maxCount');
        let realAutoupload = this.data.get('realAutoupload');
        let requestMode = this.data.get('requestMode');
        let order = this.data.get('order');
        let isReplacing = !!replacingFile;

        this.canceled = false;
        this.data.set('error', {
            sizeInvalid: false,
            typeInvalid: false,
            countOverflow: false
        });

        let newFiles;
        // 目前只考虑使用xmlhttprequest对象上传的情况
        newFiles = [...this.ref('input').files].filter(file => {
            return this.validateFile(file);
        });

        if (!newFiles.length) {
            return;
        }

        if (isReplacing) {
            // type=image时，点击重新上传进入此分支，替换掉原位置的文件replacingFile
            let newFile = newFiles[0];
            newFile.toBeUploaded = true;
            if (requestMode !== 'iframe' && window.URL) {
                newFile.src = window.URL.createObjectURL(newFile);
            }

            let replacingIndex = fileList.indexOf(replacingFile);
            this.removeFile(replacingFile);
            fileList.splice(replacingIndex, 0, null);
            this.data.set(`fileList[${replacingIndex}]`, newFile);
            this.data.set('replacingFile', null);

            if (requestMode !== 'iframe' && realAutoupload) {
                this.uploadFile(newFile);
            }
        }
        else {
            if (maxCount !== 1 && (fileList.length + newFiles.length) > maxCount) {
                this.data.set('error.countOverflow', true);
                return;
            }

            let currentFiles = fileList.filter(file => file.status !== 'failure');

            let needImageSrc = requestMode !== 'iframe' && type === 'image' && window.URL;
            newFiles = newFiles.map(file => {
                if (needImageSrc) {
                    file.src = window.URL.createObjectURL(file);
                }

                file.toBeUploaded = true;
                return file;
            });

            if (order === 'desc') {
                this.data.set('fileList', [...newFiles, ...currentFiles]);
            }
            else {
                this.data.set('fileList', [...currentFiles, ...newFiles]);
            }

            if (maxCount === 1) {
                this.data.set('fileList', this.data.get('fileList').slice(-1));
            }

            if (requestMode !== 'iframe' && realAutoupload) {
                this.uploadFiles();
            }
        }
    }

    validateFile({name, size}) {
        let typeValidation = this.validateFileType(name);
        this.data.set('error.typeInvalid', !typeValidation);

        let sizeValidation = this.validateFileSize(size);
        this.data.set('error.sizeInvalid', !sizeValidation);

        return typeValidation && sizeValidation;
    }

    validateFileType(filename) {
        let accept = this.data.get('accept');
        let extensions = this.data.get('extension');
        if (!accept) {
            return true;
        }

        let extension = last(filename.split('.')).toLowerCase();

        return accept.split(/,\s*/).some(item => {
            let acceptExtention = last(item.split(/[./]/)).toLowerCase();
            // 对于类似'application/msword'这样的mimetype与扩展名对不上的情形跳过校验
            if (acceptExtention === extension
                || (acceptExtention !== '*' && item.indexOf('/') > -1)) {
                return true;
            }

            if (acceptExtention === '*'
                && item.indexOf('/') > -1
                && extensions.indexOf(extension) > -1) {
                return true;
            }

            return false;
        });
    }

    validateFileSize(fileSize) {
        let maxSize = this.data.get('size');
        return !maxSize || !fileSize || fileSize <= bytes.parse(maxSize);
    }
    uploadFiles() {
        let fileList = this.data.get('fileList');
        fileList.forEach(file => {
            if (file.toBeUploaded) {
                this.uploadFile(file);
            }
        });
    }
    onprogress(file, progress) {
        let fileList = this.data.get('fileList');
        let index = fileList.indexOf(file);
        let requestMode = this.data.get('requestMode');
        let files = this.data.get('files');
        let progressType = this.data.get('progress');
        switch (progressType) {
            case 'number':
            case 'bar':
                file.loaded = progress.loaded;
                file.total = progress.total;
                this.updateFileList(file);
                // this.data.set(`fileList[${index}].loaded`, progress.loaded);
                // this.data.set(`fileList[${index}].total`, progress.total);
                break;
        }
        this.fire('progress', files[index], index, requestMode === 'xhr' ? progress : null);
    }

    onload(file, data) {
        this.uploadCallback(data, file);
    }
    onerror(file, error) {
        let fileList = this.data.get('fileList');
        let files = this.data.get('files');
        let index = fileList.indexOf(file);
        this.showFailureResult(error || {}, file);
        this.fire('failure', files[index], index);
    }
    uploadFile(file) {
        let name = this.data.get('name');
        let payload = this.data.get('payload');
        let queryURL = this.data.get('action');
        let requestMode = this.data.get('requestMode');
        let headers = this.data.get('headers');
        let withCredentials = this.data.get('withCredentials');
        let upload = this.data.get('upload');
        this.updateFileList(file, 'uploading');

        if (requestMode === 'xhr' && !upload) {
            let xhr = new XMLHttpRequest();
            file.xhr = xhr;

            xhr.upload.onprogress = e => this.onprogress(file, e);
            xhr.onload = () => this.onload(file, this.parseData(xhr.responseText));
            xhr.onerror = e => this.onerror(file, e);

            let formData = new FormData();
            formData.append(name, file);

            for (let key in payload) {
                formData.append(key, payload[key]);
            }

            xhr.open('POST', queryURL, true);
            for (let key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
            xhr.withCredentials = withCredentials;
            xhr.send(formData);
        }
        else if (requestMode === 'custom' && upload) {
            upload.call(null, file, {
                onload: this.onload.bind(this),
                onprogress: this.onprogress.bind(this),
                onerror: this.onerror.bind(this)
            });
        }
    }
    replaceFile(e, file) {
        event.stopPropagation();
        this.data.set('replacingFile', file);
        this.nextTick(() => this.reset());
    }

    uploadCallback(data, file) {
        this.isSubmiting = false;
        this.disabledWhenSubmiting = false;
        let fileList = this.data.get('fileList');
        let files = this.data.get('files');
        let index = fileList.indexOf(file);

        data = this.data.get('convertResponse')(data) || data;
        if (data.status === 'success') {
            this.showSuccessResult(data, file);
            files = this.data.get('files');
            if (isArray(files) && files.length === 1) {
                this.data.set('value', {...files[0]});
            }
            else {
                this.data.set('value', [...files]);
            }
            this.fire('success', files[index], index);
        }
        else if (data.status === 'failure') {
            this.showFailureResult(data, file);
            files = this.data.get('files');
            this.fire('failure', files[index], index);
        }

        this.data.set('currentSubmitingFile', null);
    }
    showSuccessResult(data, file) {
        file.xhr = null;
        file.toBeUploaded = false;
        this.updateFileList(file, 'success', data, true);
        setTimeout(() => {
            this.updateFileList(file, null);
        }, 300);
    }
    showFailureResult(data, file) {
        file.xhr = null;
        file.toBeUploaded = false;
        file.failureReason = data.reason || '';
        this.updateFileList(file, 'failure', data);
    }
    updateFileList(file, status, properties, toEmit = false) {
        if (status !== undefined) {
            file.status = status;
        }

        if (properties) {
            assign(file, properties);
            file._extra = omit(properties, ['status', 'name', 'src']);
        }

        let fileList = this.data.get('fileList');
        let index = fileList.indexOf(file);
        fileList[index] = file;
        this.data.set('fileList', [...fileList]);
        let value = this.getValue(false);
        if (toEmit) {
            this.fire('change', value);
        }
    }
    getPureFile(file, properties) {
        return assign(pick(file, ['name', 'src']), omit(properties, 'status'));
    }
    getIndexInPureList(file) {
        let fileList = this.data.get('fileList');
        let initialIndex = fileList.indexOf(file);
        return initialIndex - fileList
            .slice(0, initialIndex)
            .filter(f => f.status === 'uploading' || f.status === 'failure')
            .length;
    }
    retry(file) {
        let requestMode = this.data.get('requestMode');
        if (requestMode === 'iframe') {
            this.submit(file);
        }
        else {
            this.uploadFile(file);
        }
    }
    removeFile(file) {
        this.data.set('error.countOverflow', false);
        let fileList = this.data.get('fileList');
        let maxCount = this.data.get('maxCount');
        let files = this.data.get('files');
        let isReplacing = !!this.data.get('replacingFile');

        let index = fileList.indexOf(file);
        if (maxCount === 1) {
            this.data.set('fileList', []);
        }
        else {
            this.data.removeAt('fileList', fileList.indexOf(file));
        }

        this.nextTick(() => {
            let files = this.data.get('files');
            if (isArray(files) && files.length === 1) {
                this.data.set('value', {...files[0]});
            }
            else {
                this.data.set('value', [...files]);
            }
        });

        if (!file.toBeUploaded) {
            this.fire('change', this.getValue(true));
        }

        if (!isReplacing) {
            this.fire('remove', {file: files[index], index});
        }
    }
    cancelFile(file) {
        if (file.xhr) {
            file.xhr.abort();
        }

        this.removeFile(file);
    }
    reset() {
        this.ref('input').value = '';
        this.ref('label').appendChild(this.ref('input'));
    }
    parseData(data) {
        if (typeof data === 'object') {
            return data;
        }

        let dataType = this.data.get('dataType');

        if (typeof data === 'string') {
            if (dataType === 'json') {
                try {
                    return JSON.parse(data);
                }
                catch (error) {
                    this.fire('failure', {
                        error
                    });
                    return {
                        status: 'failure'
                    };
                }
            }
            else if (dataType === 'text') {
                return data;
            }
        }
    }

    getValue(isEmptyValue) {
        let maxCount = this.data.get('maxCount');
        let compat = this.data.get('compat');
        let pureFileList = this.data.get('pureFileList');
        if (maxCount !== 1) {
            return pureFileList;
        }

        if (isEmptyValue) {
            return null;
        }

        return pureFileList[0];
    }

    stopEvent(e) {
        e.stopPropagation();
    }
}
