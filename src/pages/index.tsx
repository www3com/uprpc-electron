import {ConfigProvider} from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import {Provider} from "mobx-react";
import {Rpc} from "@/stores/rpc";
import FileTree from "@/pages/components/File";
import {Allotment} from "allotment";
import "allotment/dist/style.css";
import React from "react";
import Tabs from "@/pages/components/Tabs";

const store = new Rpc()
export default function HomePage() {
    return (
        <Provider store={store}>
            <ConfigProvider locale={zhCN}>
                <Allotment defaultSizes={[50, 220]}>
                    <Allotment.Pane minSize={260} maxSize={600}>
                        <FileTree/>
                    </Allotment.Pane>
                    <Tabs/>
                </Allotment>
            </ConfigProvider>
        </Provider>
    );
}
