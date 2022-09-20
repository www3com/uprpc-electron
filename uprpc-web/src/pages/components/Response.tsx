import React from "react";
import {Dropdown, Menu, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import Stream from "@/pages/components/Stream";
import {Method, Mode, ParseType, parseTypeMap, ResponseCache} from "@/types/types";
import fatherrc from "@umijs/did-you-know/.fatherrc";
import {decode} from "@/utils/metadata";

interface responseProps {
    method: Method,
    responseCache?: ResponseCache,
    onChange: (method: Method) => void
}

export default ({method, responseCache, onChange}: responseProps) => {
    const handleChange = (id: number, key: string, parseType: number) => {
        if (method.responseMds == null) {
            method.responseMds = [];
        }
        method.requestMds?.push({id: id, key: key, parseType: parseType})
        onChange({...method});
    }

    const columns = [
        {title: 'name', dataIndex: 'name', key: 'name'},
        {
            title: 'Value', dataIndex: 'value', key: 'value', render: function (title: string, record: any) {
                if (/-bin$/.test(record.key)) {
                    return <BufferValue id={record.id} value={record.value} parseType={record.parseType}
                                        onChange={(id, parseType) => handleChange(id, record.key, parseType)}/>
                }
                return title;
            }
        }
    ];
    
    const tab = method.mode == Mode.ServerStream || method.mode == Mode.BidirectionalStream ?
        {key: 'response', label: 'Response Stream', children: <Stream value={responseCache?.streams}/>} : {
            key: ' response', label: 'Response',
            children: <AceEditor
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

    const tabItems = [tab, {
        label: 'Metadata', key: 'matadata',
        children: <Table size='small' bordered={true} pagination={false} columns={columns} rowKey='id'
                         dataSource={responseCache?.mds}/>
    }];

    return <Tabs style={{height: "100%"}} animated={false} items={tabItems}/>;
}


interface BufferValueProp {
    id: number,
    value: any,
    parseType: number,
    onChange: (id: number, parseType: number) => void
}

const BufferValue = ({id, value, parseType, onChange}: BufferValueProp) => {
    let menus: any[] = [];
    parseTypeMap.forEach((value, key, map) => {
        menus.push({key: key.toString(), label: value})
    });
    return (<Dropdown overlay={<Menu onClick={(item) => onChange(id, Number.parseInt(item.key))} items={menus}/>}>
            <a>{decode(value, parseType)}</a>
        </Dropdown>
    );
}
