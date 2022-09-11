import React, {Key, useContext, useState} from "react";
import {observer} from "mobx-react-lite";
import {Col, Input, Layout, notification, Row, Space, Tabs, Tooltip, Tree} from "antd";
import {
    BlockOutlined,
    CloseCircleOutlined,
    DatabaseOutlined,
    DownOutlined,
    FileOutlined,
    FilterOutlined,
    FolderOutlined,
    HddOutlined,
    PlusCircleOutlined,
    ReloadOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {context} from "@/stores/context";
import Paths from "@/pages/components/Paths";
import {Proto, TabType} from "@/types/types";

const file = () => {
    let {tabStore, protoStore, pathsStore} = useContext(context);
    const [hidden, setHidden] = useState(true);

    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const onExpand = (newExpandedKeys: string[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const getExpandedKeys = (value: string): string[] => {
        let keys = [];
        for (let proto of protoStore.protos) {
            if (proto.name.indexOf(value) > -1) {
                keys.push(proto.id);
            }
            for (let service of proto.services) {
                if (service.name.indexOf(value) > -1) {
                    keys.push(service.id);
                }
                for (let method of service.methods) {
                    console.log(method.name, method.name.indexOf(value))
                    if (method.name.indexOf(value) > -1) {
                        keys.push(method.id);
                    }
                }
            }
        }
        return keys;
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        let keys = getExpandedKeys(value);
        console.log(value, keys)
        setExpandedKeys(keys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };


    const parse = (protos: Proto[]) => {
        let treeData = [];
        for (let proto of protos) {
            let item: any = {key: proto.id, title: proto.name, icon: <FileOutlined/>, children: []};

            for (let service of proto.services) {
                let methods = [];
                for (let m of service.methods) {
                    // const strTitle = m.name;
                    // const index = strTitle.indexOf(searchValue);
                    // const beforeStr = strTitle.substring(0, index);
                    // const afterStr = strTitle.slice(index + searchValue.length);
                    // const title =
                    //     index > -1 ? (<span>{beforeStr}
                    //             <span style={{color: '#f50'}}>{searchValue}</span>
                    //             {afterStr}
                    //             </span>
                    //     ) : (
                    //         <span>{strTitle}</span>
                    //     );
                    methods.push({key: m.id, title: m.name, icon: <BlockOutlined/>})
                }

                item.children.push({
                    key: service.id,
                    title: service.name,
                    icon: <DatabaseOutlined/>,
                    children: methods
                })
            }
            treeData.push(item)
        }
        return treeData;
    }


    const onSelect = (selectedKeys: Key[], e: any) => {
        if (e.node.pos.split('-').length != 4) return
        tabStore.openTab({
            key: selectedKeys[0].toString(),
            params: e.node.pos,
            type: TabType.Proto,
            title: e.node.title
        });
    }

    const onImport = async () => {
        const result = await protoStore.importFile()
        debugger
        if (!result.success) {
            notification.open({
                message: 'Error while importing protos',
                description: result.message,
                icon: <CloseCircleOutlined style={{color: 'red'}}/>
            });
        }
    };

    const items = [{
        label: (<Space direction='vertical' size={0} align={"center"}>
            <HddOutlined style={{fontSize: 20, marginRight: 0}}/>
            <div style={{fontSize: 10}}>GRPC</div>
        </Space>),
        key: '1', children: <>
            <Input size='small' placeholder='Filter Methods' hidden={hidden}
                   onChange={onChange}
                   style={{marginBottom: 5}}/>
            <Tree.DirectoryTree
                // @ts-ignore
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={onSelect}
                switcherIcon={<DownOutlined/>}
                defaultExpandedKeys={['0-0-0']}
                treeData={parse(protoStore.protos)}/></>
    }, {
        label: (<Space direction='vertical' size={0}>
            <SettingOutlined style={{fontSize: 20, marginRight: 0}}/>
            <div style={{fontSize: 10}}>ENV</div>
        </Space>),
        key: '2',
        children: '内容 2'
    }];

    return (
        <Layout style={{height: '100%', paddingTop: '5px'}}>
            <Layout.Header style={{
                padding: 0,
                backgroundColor: 'white',
                height: '40px',
                lineHeight: '40px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Row>
                    <Col flex='auto' style={{paddingLeft: 10, fontSize: 18}}>upRpc</Col>
                    <Col flex="100px">
                        <Space size={8} style={{paddingRight: 10}}>
                            <Tooltip title='Import Protos'>
                                <a style={{color: '#000000D9', fontSize: 16}}
                                   onClick={onImport}><PlusCircleOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Import Paths'>
                                <a style={{color: '#000000D9', fontSize: 16}}
                                   onClick={() => pathsStore.showPaths(!pathsStore.pathsDrawerVisible)}><FolderOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Reload'>
                                <a style={{color: '#000000D9', fontSize: 16}}><ReloadOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Filter Methods'>
                                <a style={{color: '#000000D9', fontSize: 16}}
                                   onClick={() => setHidden(!hidden)}><FilterOutlined/></a>
                            </Tooltip>

                        </Space>
                    </Col>
                </Row>

            </Layout.Header>
            <Layout.Content style={{backgroundColor: 'white'}}>
                <Tabs tabPosition='left' size='small' style={{height: '100%'}} items={items}/>
                <Paths/>
            </Layout.Content>
        </Layout>
    )
}

export default observer(file)