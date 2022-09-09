import React, {useState} from "react";
import {Button, Collapse, Empty} from "antd";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"

interface StreamProps {
    value?: string[]
}

export default ({value}: StreamProps) => {
    if (value == null || value.length == 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }
    return (<Collapse defaultActiveKey={['1']} accordion>
        {value?.map(function (item, index) {
            return <Collapse.Panel header={'stream' + index} key={index}>
                <pre style={{padding: 0}}>
                    {item}
                </pre>
            </Collapse.Panel>
        })}
    </Collapse>)
}