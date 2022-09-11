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

    const items = [
        {
            label: 'Metadata',
            key: 'matadata',
            children: <Table size='small' bordered={true} pagination={false} columns={columns}/>
        }
    ];
    let tab = {label: '', key: 'response', children: <></>}
    if (method.mode == Mode.ServerStream || method.mode == Mode.BidirectionalStream) {
        tab = {...tab, label: 'Response Stream', children: <Stream value={responseCache?.streams}/>}
    } else {
        tab = {
            ...tab, label: 'Response', children: <AceEditor
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
            />
        }
    }
    items.unshift(tab);

    return <Tabs style={{height: "100%"}} animated={false} items={items}/>;
}
