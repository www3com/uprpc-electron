import React, {useState} from "react";
import {Button, Collapse, Empty} from "antd";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"

interface StreamProps {
    value?: string[]
}

export default ({value}: StreamProps) => {
    const [selectedKey, setSelectedKey] = useState("1")
    if (value == null) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
    }
    // @ts-ignore
    return (<Collapse activeKey={selectedKey} accordion onChange={key => setSelectedKey(key)}>
        {value?.map(function (item, index) {
            return <Collapse.Panel header={'stream' + (index + 1)} key={index + 1}>
                <pre style={{padding: 0}}>
                    {item}
                </pre>
            </Collapse.Panel>
        })}
    </Collapse>)
}