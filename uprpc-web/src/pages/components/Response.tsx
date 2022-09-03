import React from "react";
import {Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"

interface responseProps {
    body: string,
    metadata?: [],
    onChange?: (body: string, metadata: []) => void
}

export default ({body, metadata, onChange}: responseProps) => {

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'}
    ];

    console.log('response compo,' , body)
    return (<Tabs style={{height: "100%"}} animated={false}>
        <Tabs.TabPane tab='Response' key='response'>
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
                value={body}
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
        </Tabs.TabPane>
        <Tabs.TabPane tab='Metadata' key='metadata'>
            <Table size='small' bordered={true} pagination={false} columns={columns}/>
        </Tabs.TabPane>
    </Tabs>)
}
