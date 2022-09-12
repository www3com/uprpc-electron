import React, {Key, useContext, useState} from "react";
import {observer} from "mobx-react-lite";
import {Col, Empty, Input, Layout, message, Modal, notification, Row, Space, Tabs, Tooltip, Tree} from "antd";
import {
    BlockOutlined,
    CloseCircleOutlined,
    DatabaseOutlined, DeleteOutlined,
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
import {Proto, TabType} from "@/types/types";
import IncludeDir from "@/pages/components/IncludeDir";

interface DeleteProto {
    id: string,
    name: string
}

const file = () => {
    let {tabStore, protoStore, includeDirStore} = useContext(context);
    const [visible, setVisible] = useState(false);

    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [deleteProto, setDeleteProto] = useState<DeleteProto>();

    const showSearchBox = (visible: boolean) => {
        setVisible(visible);
        if (!visible) {
            setSearchValue('');
        }
    }

    const onExpand = (newExpandedKeys: string[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const getExpandedKeys = (value: string): string[] => {
        let keys = [];
        for (let proto of protoStore.protos) {
            if (proto.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                keys.push(proto.id);
            }
            for (let service of proto.services) {
                if (service.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    keys.push(service.id);
                }
                for (let method of service.methods) {
                    if (method.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
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


    const getTitle = (strTitle: string, value: string) => {
        const index = strTitle.toLowerCase().indexOf(searchValue.toLowerCase());
        const beforeStr = strTitle.substring(0, index);
        const middleStr = strTitle.substring(index, index + searchValue.length);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title = index > -1 ?
            <span>{beforeStr}<span style={{color: '#f50'}}>{middleStr}</span>{afterStr}</span>
            : <span>{strTitle}</span>;
        return title;
    }

    const parse = (protos: Proto[]) => {
        let treeData = [];
        for (let proto of protos) {
            let item: any = {
                key: proto.id,
                title: <span style={{width: '100%'}}>{getTitle(proto.name, searchValue)}</span>,
                icon: <FileOutlined/>,
                children: []
            };
            for (let service of proto.services) {
                let methods = [];
                for (let m of service.methods) {
                    methods.push({key: m.id, title: getTitle(m.name, searchValue), icon: <BlockOutlined/>})
                }

                item.children.push({
                    key: service.id,
                    title: getTitle(service.name, searchValue),
                    icon: <DatabaseOutlined/>,
                    children: methods
                })
            }
            treeData.push(item)
        }
        return treeData;
    }


    const onSelect = (selectedKeys: Key[], e: any) => {
        setDeleteProto(undefined);
        let pos = e.node.pos.split('-');
        if (pos.length == 2) {
            let proto = protoStore.protos[pos[1]];
            setDeleteProto({id: proto.id, name: proto.name})
        } else if (pos.length == 4) {
            tabStore.openTab({
                key: selectedKeys[0].toString(),
                params: e.node.pos,
                type: TabType.Proto,
            });
        }
    }

    const onImport = async () => {
        const result = await protoStore.importProto()
        if (!result.success) {
            notification.open({
                message: 'Error while importing protos',
                description: result.message,
                icon: <CloseCircleOutlined style={{color: 'red'}}/>
            });
        }
    };

    const onReload = () => {
        protoStore.reloadProto()
        message.success("Reload protos successful.")
    };

    const onDelete = async () => {
        if (deleteProto == null) {
            message.warn('Please select the deleted proto.');
            return;
        }

        Modal.confirm({
            title: 'Confirm delete proto',
            content: 'Do you want to remove the proto configuration '.concat(deleteProto.name, '?'),
            onOk: () => {
                protoStore.deleteProto(deleteProto.id);
                setDeleteProto(undefined);
            }
        });
    };

    let datasource = parse(protoStore.protos);
    const items = [{
        label: (<Space direction='vertical' size={0} align={"center"}>
            <HddOutlined style={{fontSize: 20, marginRight: 0}}/>
            <div style={{fontSize: 10}}>GRPC</div>
        </Space>),
        key: '1', children: <>
            <Input size='small' placeholder='Filter Methods' hidden={!visible}
                   onChange={onChange}
                   value={searchValue}
                   style={{marginBottom: 5}}/>
            {datasource.length == 0 ?
                <div style={{height: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Empty
                    description='No proto'/></div> :
                <Tree.DirectoryTree
                    // @ts-ignore
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onSelect={onSelect}
                    switcherIcon={<DownOutlined/>}
                    defaultExpandedKeys={['0-0-0']}
                    treeData={datasource}/>}</>
    }, {
        label: (<Space direction='vertical' size={0}>
            <SettingOutlined style={{fontSize: 20, marginRight: 0}}/>
            <div style={{fontSize: 10}}>ENV</div>
        </Space>),
        key: '2',
        children: 'Please look forward to it!'
    }];

    return (
        <Layout style={{height: '100%'}}>
            <Layout.Header style={{
                padding: 0,
                backgroundColor: 'white',
                height: '44px',
                lineHeight: '44px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Row>
                    <Col flex='auto' style={{paddingLeft: 10, fontSize: 18}}>upRpc</Col>
                    <Col flex="100px">
                        <Space size={8} style={{paddingRight: 10}}>
                            <Tooltip title='Import protos'>
                                <a style={{color: '#000000D9', fontSize: 16}}
                                   onClick={onImport}><PlusCircleOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Reload protos'>
                                <a style={{color: '#000000D9', fontSize: 16}} onClick={onReload}><ReloadOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Delete selectecd proto'>
                                <a style={{color: '#000000D9', fontSize: 16}} onClick={onDelete}><DeleteOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Import dependency paths'>
                                <a style={{color: '#000000D9', fontSize: 16}}
                                   onClick={() => includeDirStore.showIncludeDir(!includeDirStore.includeDirDrawerVisible)}><FolderOutlined/></a>
                            </Tooltip>
                            <Tooltip title='Filter methods'>
                                <a style={{color: '#000000D9', fontSize: 16}}
                                   onClick={() => showSearchBox(!visible)}><FilterOutlined/></a>
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>

            </Layout.Header>
            <Layout.Content style={{backgroundColor: 'white'}}>
                <Tabs tabPosition='left' size='small' style={{height: '100%'}} items={items}/>
                <IncludeDir/>
            </Layout.Content>
        </Layout>
    )
}

export default observer(file)