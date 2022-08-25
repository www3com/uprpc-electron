import {ConfigProvider} from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import {Provider} from "mobx-react";
import FileTree from "@/pages/components/File";
import {Allotment} from "allotment";
import "allotment/dist/style.css";
import React from "react";
import Tabs from "@/pages/components/Tabs";

import store, {context} from '../stores/rpc'


export default function HomePage() {

    return (
        <context.Provider value={{store: new store()}}>
            <ConfigProvider locale={zhCN}>
                <Allotment defaultSizes={[50, 220]}>
                    <Allotment.Pane minSize={260} maxSize={600}>
                        <FileTree/>
                    </Allotment.Pane>
                    <Tabs/>
                </Allotment>
            </ConfigProvider>
        </context.Provider>
    );
}
