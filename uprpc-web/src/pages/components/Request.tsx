import React, {useState} from "react";
import {Button, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"

interface requestProps {
    body: string,
    metadata?: [],
    onChange?: (body: string, metadata: []) => void
}

export default ({body, metadata, onChange}: requestProps) => {

    const [metadataState, setMetadataState] = useState(metadata);

    const aceChange = (v: string) => {
        onChange(v, metadataState)
    }

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'},
        {
            title: 'Action', dataIndex: 'action', key: 'action',
            render: (text: string, record: any) => (<a>编码</a>)
        }
    ];

    return (<Tabs style={{height: "100%"}} animated={false}>
        <Tabs.TabPane tab='Params' key='params'>
            <AceEditor
                style={{background: "#fff"}}
                width={"100%"}
                height='100%'
                mode="json"
                theme="textmate"
                name="inputs"
                fontSize={13}
                cursorStart={2}
                showPrintMargin={false}
                showGutter
                onChange={aceChange}
                defaultValue={body}
                setOptions={{
                    useWorker: true,
                    displayIndentGuides: true
                }}
                tabSize={2}
            />
        </Tabs.TabPane>
        <Tabs.TabPane tab='Metadata' key='metadata'>
            <Table size='small' bordered={true} pagination={false} dataSource={metadata} columns={columns}/>
        </Tabs.TabPane>
    </Tabs>)
}