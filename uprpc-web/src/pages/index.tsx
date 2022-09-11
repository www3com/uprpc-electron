import {ConfigProvider} from "antd";
import FileTree from "@/pages/components/File";
import {Allotment} from "allotment";
import "allotment/dist/style.css";
import React from "react";
import Tabs from "@/pages/components/Tabs";

import {pathsStore, tabStore, protoStore, context} from '@/stores/context'

export default function HomePage() {
    return (
        <context.Provider value={{pathsStore, tabStore, protoStore}}>
            <ConfigProvider>
                <Allotment defaultSizes={[75, 220]}>
                    <Allotment.Pane minSize={320} maxSize={600}>
                        <FileTree/>
                    </Allotment.Pane>
                    <Tabs/>
                </Allotment>
            </ConfigProvider>
        </context.Provider>
    );
}
