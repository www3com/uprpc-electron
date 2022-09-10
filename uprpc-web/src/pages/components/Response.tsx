import React from "react";
import {Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import Stream from "@/pages/components/Stream";
import {Method, Mode, ResponseCache} from "@/types/types";

interface responseProps {
    method: Method,
    responseCache?: ResponseCache,
    onChange?: (responseCache: ResponseCache) => void
}

export default ({method, responseCache, onChange}: responseProps) => {

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'}
    ];

    let isStream = method.mode==Mode.ServerStream || method.mode == Mode.BidirectionalStream;
    return (
        <Tabs style={{height: "100%"}} animated={false}>
            <Tabs.TabPane tab={isStream? 'Response Stream' : 'Response'} key='response'>
                {isStream ?
                    <Stream value={responseCache?.streams}/> :
                    <AceEditor
                        style={{background: "#fff"}}
                        width={"100%"}
                        height='100%'
                        mode="json"
                        theme="textmate"
                        name="inputs"
                        fontSize={13}
                        cursorStart={2}
                        highlightActiveLine={false}
                        showPrintMargin={false}
                        showGutter={false}
                        value={responseCache?.body}
                        setOptions={{
                            showLineNumbers: false,
                            highlightGutterLine: false,
                            fixedWidthGutter: false,
                            tabSize: 1,
                            displayIndentGuides: false
                        }}
                        readOnly={true}
                        tabSize={2}
                    />}

            </Tabs.TabPane>
            <Tabs.TabPane tab='Metadata' key='metadata'>
                <Table size='small' bordered={true} pagination={false} columns={columns}/>
            </Tabs.TabPane>
        </Tabs>

    )
}
