import React, {useState} from "react";
import {inject, observer} from "mobx-react";
import {Button, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
const request = ({store}: any) => {
    const dataSource = [
        {
            key: '1',
            name: '胡彦斌1',
            age: 32,
            address: '西湖区湖底公园1号',
        },
        {
            key: '2',
            name: '胡彦祖',
            age: 42,
            address: '西湖区湖底公园1号',
        },
    ];

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        }, {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
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
                // value={data}
                setOptions={{
                    useWorker: true,
                    displayIndentGuides: true
                }}
                tabSize={2}
            />
        </Tabs.TabPane>
        <Tabs.TabPane tab='Metadata' key='metadata'>
            <Table size='small' bordered={true} pagination={false} dataSource={dataSource} columns={columns}/>
        </Tabs.TabPane>
    </Tabs>)
}

export default inject('store')(observer(request))