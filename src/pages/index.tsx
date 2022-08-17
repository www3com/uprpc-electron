import {ConfigProvider, Layout, Tabs} from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import {Provider} from "mobx-react";
import {Rpc} from "@/stores/rpc";
import FileTree from "@/pages/components/File";
import {Allotment} from "allotment";
import "allotment/dist/style.css";
import Editor from "@/pages/components/Editor";
import React from "react";

const store = new Rpc()
export default function HomePage() {

    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        store.remove(targetKey)
    };
    return (
        <Provider store={store}>
            <ConfigProvider locale={zhCN}>
                <Allotment defaultSizes={[40, 240]}>
                    <Allotment.Pane minSize={200} maxSize={400}>
                        <FileTree/>
                    </Allotment.Pane>
                    <Tabs hideAdd type="editable-card" onEdit={onEdit} style={{height: "100%"}}>
                        {store.tabs.map((value: { id: number, title: string }) => {
                            return (<Tabs.TabPane tab={value.title} key={value.id} style={{height: "100%"}}>
                                <Editor/>
                            </Tabs.TabPane>)
                        })}
                    </Tabs>
                </Allotment>

            </ConfigProvider>
        </Provider>

    );
}
