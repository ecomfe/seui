/**
 * @file routes
 */

import san from 'san';
import Icon from './components/Icon';
import Select from './components/Select';
import Button from './components/Button';
import ButtonGroup from './components/ButtonGroup';
import Calendar from './components/Calendar';
import Carousel from './components/Carousel';
import Input from './components/Input';
import InputNumber from './components/InputNumber';
import Radio from './components/Radio';
import RadioGroup from './components/RadioGroup';
import Checkbox from './components/Checkbox';
import CheckboxGroup from './components/CheckboxGroup';
import Switch from './components/Switch';
import DatePicker from './components/DatePicker';
import Table from './components/Table';
import Tooltip from './components/Tooltip';
import Progress from './components/Progress';
import Pager from './components/Pager';
import Dropdown from './components/Dropdown';
import Alert from './components/Alert';
import Dialog from './components/Dialog';
import Schedule from './components/Schedule';
import Tabs from './components/Tabs';
import Toast from './components/Toast';
import Form from './components/Form';
import BreadCrumb from './components/BreadCrumb';
import RegionPicker from './components/RegionPicker';
import Tree from './components/Tree';
import Textarea from './components/Textarea';
import Searchbox from './components/Searchbox';
import Transfer from './components/Transfer';
import Uploader from './components/Uploader';
import Test from './components/Test';

let routes = [
    {
        rule: '/',
        Component: san.defineComponent({
            template: '<p>欢迎使用seui</p>'
        })
    },
    {
        rule: '/Icon',
        Component: Icon
    },
    {
        rule: '/Select',
        Component: Select
    },
    {
        rule: '/Button',
        Component: Button
    },
    {
        rule: '/ButtonGroup',
        Component: ButtonGroup
    },
    {
        rule: '/Calendar',
        Component: Calendar
    },
    {
        rule: '/Carousel',
        Component: Carousel
    },
    {
        rule: '/Input',
        Component: Input
    },
    {
        rule: '/InputNumber',
        Component: InputNumber
    },
    {
        rule: '/Checkbox',
        Component: Checkbox
    },
    {
        rule: '/CheckboxGroup',
        Component: CheckboxGroup
    },
    {
        rule: '/Radio',
        Component: Radio
    },
    {
        rule: '/RadioGroup',
        Component: RadioGroup
    },
    {
        rule: '/Switch',
        Component: Switch
    },
    {
        rule: '/DatePicker',
        Component: DatePicker
    },
    {
        rule: '/Table',
        Component: Table
    },
    {
        rule: '/Tooltip',
        Component: Tooltip
    },
    {
        rule: '/Progress',
        Component: Progress
    },
    {
        rule: '/Pager',
        Component: Pager
    },
    {
        rule: '/Dropdown',
        Component: Dropdown
    },
    {
        rule: '/Alert',
        Component: Alert
    },
    {
        rule: '/Dialog',
        Component: Dialog
    },
    {
        rule: '/Schedule',
        Component: Schedule
    },
    {
        rule: '/Tabs',
        Component: Tabs
    },
    {
        rule: '/BreadCrumb',
        Component: BreadCrumb
    },
    {
        rule: '/Toast',
        Component: Toast
    },
    {
        rule: '/Form',
        Component: Form
    },
    {
        rule: '/RegionPicker',
        Component: RegionPicker
    },
    {
        rule: '/Tree',
        Component: Tree
    },
    {
        rule: '/Textarea',
        Component: Textarea
    },
    {
        rule: '/Transfer',
        Component: Transfer
    },
    {
        rule: '/Searchbox',
        Component: Searchbox
    },
    {
        rule: '/Uploader',
        Component: Uploader
    },
    {
        rule: '/Test',
        Component: Test
    }
];

routes = routes.map(item => {
    item.target = '#content';
    return item;
});
routes = routes.sort((a, b) => {
    if (a.rule > b.rule) {
        return 1;
    }
    else if (a.rule < b.rule) {
        return -1;
    }
    else {
        return 0;
    }
});
export default routes;
