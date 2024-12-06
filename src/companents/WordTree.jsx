import React, { useState, useEffect, useRef } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { BsPencil } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { BsInfoCircle } from "react-icons/bs";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import 'primeicons/primeicons.css';
import descriptionApi from '../api/descriptionApi';

const WordTree = ({ 
  wordsArray, 
  onRowEditComplete, 
  setVisibleDeleteDescription, 
  setDeletedDescriptionId, 
  setWordId,
  setVisibleDeleteWord,
  deleteWordHandler,
  globalFilterFields,
  setOpenDescriptionModal,
  setOpenWordModal,
  setIsWordOnly,
}) => {
  const [nodes, setNodes] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [editingRows, setEditingRows] = useState({});
  const [filters, setFilters] = useState({});
  const [visibleEditConfirm, setVisibleEditConfirm] = useState(false);
  const [editingNode, setEditingNode] = useState(false);
  const [visibleInfoDialog, setVisibleInfoDialog] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [a, setA] = useState('');
  const [showRemoveOrderConfirm, setShowRemoveOrderConfirm] = useState(false);
  const [orderToBeUpdated, setOrderToBeUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const cm2 = useRef(null);

  useEffect(() => {
    if (wordsArray) {
      const approvedWords = wordsArray.filter(word => 
        word.descriptions.some(desc => desc.status === 'Onaylı')
      );

      const mappedNodes = approvedWords.map(word => ({
        key: word.wordId,
        data: { 
          wordContent: word.wordContent,
          descriptionContent: '',
          lastEditedDate: '',
          recommender: '',
          status: ''
        },
        children: word.descriptions
          .filter(desc => desc.status === 'Onaylı')
          .sort((a, b) => a.order - b.order) // Sort by order
          .map(desc => ({
            key: desc.descriptionId,
            data: {
              wordContent: word.wordContent,
              descriptionContent: desc.descriptionContent,
              lastEditedDate: desc.lastEditedDate,
              recommender: desc.recommender,
              status: desc.status,
              descriptionId: desc.descriptionId,
              order: desc.order
            }
          }))
      }));

      const nodesWithChildren = mappedNodes.filter(node => node.children.length > 0);
      setNodes(nodesWithChildren);
    }
  }, [wordsArray, a]);

  const onEditorValueChange = (options, value) => {
    const newNodes = JSON.parse(JSON.stringify(nodes));
    const editedNode = findNodeByKey(newNodes, options.node.key);
    if (editedNode) {
      editedNode.data[options.field] = value;
      setNodes(newNodes);
    }
  };
  
  const findNodeByKey = (nodes, key) => {
    for (let node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        let result = findNodeByKey(node.children, key);
        if (result) return result;
      }
    }
    return null;
  };

  const inputTextEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.rowData[options.field]}
        onChange={(e) => onEditorValueChange(options, e.target.value)}
      />
    );
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    
    if (!value) {
      setExpandedKeys({});
    } else {
      const newExpandedKeys = {};
      expandNodesMatchingFilter(nodes, value, newExpandedKeys);
      setExpandedKeys(newExpandedKeys);
    }
  };

  const expandNodesMatchingFilter = (nodes, filterValue, expandedKeys, parentKey = null) => {
    nodes.forEach(node => {
      if (nodeMatchesFilter(node, filterValue)) {
        if (parentKey) expandedKeys[parentKey] = true;
        expandedKeys[node.key] = true;
      }
      if (node.children) {
        expandNodesMatchingFilter(node.children, filterValue, expandedKeys, node.key);
      }
    });
  };

  const nodeMatchesFilter = (node, filterValue, field = null) => {
    if (field) {
      return typeof node.data[field] === 'string' && 
             node.data[field].toLowerCase().includes(filterValue.toLowerCase());
    }
    return Object.values(node.data).some(value => 
      typeof value === 'string' && value.toLowerCase().includes(filterValue.toLowerCase())
    );
  };

  const onColumnFilterChange = (event) => {
    setFilters(event.filters);
    applyFilters(event.filters);
  };

  const applyFilters = (currentFilters) => {
    const hasActiveFilters = Object.values(currentFilters).some(filter => filter.value);
    
    if (!hasActiveFilters) {
      setExpandedKeys({});
      return;
    }

    const newExpandedKeys = {};
    expandNodesMatchingColumnFilters(nodes, currentFilters, newExpandedKeys);
    setExpandedKeys(newExpandedKeys);
  };

  const expandNodesMatchingColumnFilters = (nodes, filters, expandedKeys, parentKey = null) => {
    nodes.forEach(node => {
      const nodeMatches = Object.entries(filters).every(([field, { value, matchMode }]) => {
        if (!value) return true;
        return nodeMatchesFilter(node, value, field);
      });

      if (nodeMatches) {
        if (parentKey) expandedKeys[parentKey] = true;
        expandedKeys[node.key] = true;
      }

      if (node.children) {
        expandNodesMatchingColumnFilters(node.children, filters, expandedKeys, node.key);
      }
    });
  };

  const headerTemplate = (
    <div className="flex justify-content-between align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" style={{ marginLeft: 190, marginTop: -10 }}/>
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Tümünde ara"
        />
      </span>
      <Button
        label="Yeni Kelime ve Anlam Ekle"
        icon="pi pi-plus"
        className="custom-button-meaning"
        onClick={() => {
          setOpenDescriptionModal(true);
          setIsWordOnly(false);
        }}
        style={{ marginLeft: "2rem" }}
        size={36}
      />
    </div>
  );

  const handleRowEditComplete = async (node) => {
    setEditingNode(node);
    setVisibleEditConfirm(true);
  };

  const confirmEdit = async () => {
    try {
      await onRowEditComplete({ newData: editingNode.data, index: editingNode });
      const newEditingRows = { ...editingRows };
      delete newEditingRows[editingNode.key];
      setEditingRows(newEditingRows);
    } catch (error) {
      console.error("Row edit failed:", error);
    }
    setVisibleEditConfirm(false);
  };

  const confirmOrderUpdate = (node, direction) => {
    const currentOrder = node.data.order;
    const parentNode = nodes.find(n => 
      n.children.some(child => child.key === node.key)
    );
    
    const siblings = parentNode.children;
    const currentIndex = siblings.findIndex(child => child.key === node.key);
    
    // Check boundaries (top & bottom)
    if (direction === 'up' && currentIndex === 0) {
      return;
    }
    if (direction === 'down' && currentIndex === siblings.length - 1) {
      return;
    }

    const siblingIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const siblingOrder = siblings[siblingIndex].data.order;

    setOrderToBeUpdated({
      id: node.data.descriptionId,
      currentOrder: currentOrder,
      newOrder: siblingOrder,
      siblingId: siblings[siblingIndex].data.descriptionId,
      siblingCurrentOrder: siblingOrder,
      siblingNewOrder: currentOrder
    });
    
    setShowRemoveOrderConfirm(true);
  };
  
  const handleOrderUpdate = async () => {
    if (!orderToBeUpdated) return;
    
    setLoading(true);
    try {
      // Update both descriptions simultaneously
      const [moveResponse, siblingResponse] = await Promise.all([
        descriptionApi.UpdateOrder(
          orderToBeUpdated.id, 
          orderToBeUpdated.newOrder
        ),
        descriptionApi.UpdateOrder(
          orderToBeUpdated.siblingId,
          orderToBeUpdated.siblingNewOrder
        )
      ]);

      if (moveResponse.isSuccess && siblingResponse.isSuccess) {
        const updatedArray = [...wordsArray];
        updatedArray.forEach(word => {
          word.descriptions.forEach(desc => {
            if (desc.descriptionId === orderToBeUpdated.id) {
              desc.order = orderToBeUpdated.newOrder;
            } else if (desc.descriptionId === orderToBeUpdated.siblingId) {
              desc.order = orderToBeUpdated.siblingNewOrder;
            }
          });
        });
        
        setA(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setLoading(false);
      setShowRemoveOrderConfirm(false);
      setOrderToBeUpdated(null);
    }
  };

  const arrows = (node) => {
    if (!node.children) {
      return(
        <>      
        <div>
          <div onClick={() => confirmOrderUpdate(node, 'up')}>
            <i className="pi pi-arrow-circle-up" 
               style={{
                 cursor: 'pointer',
                 opacity: loading ? 0.5 : 1,
                 pointerEvents: loading ? 'none' : 'auto'
               }}/>
          </div> 
          <div onClick={() => confirmOrderUpdate(node, 'down')}>
            <i className="pi pi-arrow-circle-down" 
               style={{
                 cursor: 'pointer',
                 opacity: loading ? 0.5 : 1,
                 pointerEvents: loading ? 'none' : 'auto'
               }}/>
          </div>
        </div>
        <ConfirmDialog
          visible={showRemoveOrderConfirm}
          onHide={() => setShowRemoveOrderConfirm(false)}
          message="Bu anlamın sırasını güncellemek istediğinizden emin misiniz?"
          header="Anlam Sırasının Güncellenmesi"
          icon="pi pi-exclamation-triangle"
          accept={handleOrderUpdate}
          reject={() => setShowRemoveOrderConfirm(false)}
          modal={false}
        />
        </>
      );
    }
    return null;
  };

  const actionTemplate = (node) => {
    if (editingRows[node.key]) {
      return (
        <>
          <Button
            icon="pi pi-check"
            className="p-button-rounded p-button-success p-mr-2"
            onClick={() => handleRowEditComplete(node)}
          />
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger"
            onClick={() => cancelEdit(node)}
          />
        </>
      );
    }
    return (
      <div style={{ display: 'inline-flex', gap: '5px'}}>
        {!node.children && (
          <>
            <Button
              icon={<BsPencil />}
              className="p-button-rounded p-button-success p-mr-2"
              onClick={() => startEdit(node)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => {
                setVisibleDeleteDescription(true);
                setDeletedDescriptionId(node.key);
              }}
            />
            <Button
              icon={<BsInfoCircle />}
              className="p-button-rounded p-button-info"
              onClick={() => {
                setCurrentNode(node);
                setVisibleInfoDialog(true);
              }}
            />
          </>
        )}
      </div>
    );
  };

  const wordDeleteTemplate = (node) => {
    if (node.children) {
      return (
        <>

          <Tooltip
          target={`.delete-word-${node.key}`}
          content="Kelimeyi Sil"
          tooltipOptions={{ position: 'top '}}
          tooltipClassName='tooltip-word-delete'
          />

          <span
            className={`delete-word delete-word-${node.key}`}
            onClick={() => {
              setWordId(node.key);
              setVisibleDeleteWord(true);
            }}
          >
            <BiTrash />
          </span>
        </>
      );
    }
    return null;
  };

  const startEdit = (node) => {
    setEditingRows({ ...editingRows, [node.key]: true });
  };

  const cancelEdit = (node) => {
    const newEditingRows = { ...editingRows };
    delete newEditingRows[node.key];
    setEditingRows(newEditingRows);
  };

  const renderInfoDialog = () => {
    return (
      <Dialog
        visible={visibleInfoDialog}
        onHide={() => setVisibleInfoDialog(false)}
        header="Anlam Bilgileri"
        modal
        style={{ width: '50vw' }}
      >
        {currentNode && (
          <div className="info-dialog-grid">
            <div className="info-item">
              <strong>Açıklama:</strong>
              <p>{currentNode.data.descriptionContent}</p>
            </div>
            <div className="info-item">
              <strong>Son Düzenleme Tarihi:</strong>
              <p>{currentNode.data.lastEditedDate}</p>
            </div>
            <div className="info-item">
              <strong>Anlamı Öneren:</strong>
              <p>{currentNode.data.recommender}</p>
            </div>
          </div>
        )}
      </Dialog>
    );
  };


  return (
    <>
      {renderInfoDialog()}
      <ConfirmDialog
        visible={visibleEditConfirm}
        onHide={() => setVisibleEditConfirm(false)}
        message="Bu kelimeyi güncellemek istediğinizden emin misiniz?"
        header="Güncellemeyi Onayla"
        icon="pi pi-exclamation-triangle"
        accept={confirmEdit}
        reject={cancelEdit}
        
      />
      <TreeTable 
        value={nodes} 
        filters={filters}
        filterMode="lenient"
        onFilter={onColumnFilterChange}
        globalFilterFields={globalFilterFields}
        header={headerTemplate}
        emptyMessage="Kelime bulunamadı."
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        globalFilter={globalFilterValue}
        filterDisplay="menu"
        resizableColumns
        columnResizeMode="expand"
      >
        <Column 
          field="wordContent" 
          header="Kelimeler" 
          expander 
          filter
          filterPlaceholder="Kelimeleri Ara"
          filterMatchMode="contains"
          body={(node) => (
            <div
              onClick={() => {
                const newExpandedKeys = { ...expandedKeys };
                newExpandedKeys[node.key] = !newExpandedKeys[node.key];
                setExpandedKeys(newExpandedKeys);
              }}
              onContextMenu={(e) => {
                if (node.children) {
                  setWordId(node.key);
                  cm2.current.show(e);
                }
                e.preventDefault();
              }}
            >
              {node.children ? node.data.wordContent : ''}
            </div>
          )}
          style={{ minWidth: "12rem", borderTopLeftRadius: 15 }}
          bodyStyle={{ padding: 25 }}
          headerStyle={{ paddingLeft: '30px' }}
        />
        <Column 
            header="Anlam"
            field="descriptionContent"
            filter
            filterMatchMode="contains"
            filterPlaceholder="Anlamları Ara"
            body={(node) => (
              editingRows[node.key] ? (
                inputTextEditor({ rowData: node.data, field: 'descriptionContent', node })
              ) : (
                <>
                  <div
                    className={`description-content-${node.key}`}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px'}} 
                  >
                    {node.data.descriptionContent}
                  </div>
                </>
              )
            )}
            style={{ minWidth: "12rem" }}
            headerStyle={{ paddingLeft: '30px' }}
          />

        <Column 
          header="Son Düzenleme Tarihi"
          field="lastEditedDate"
          filter
          filterMatchMode="contains"
          filterPlaceholder="Son Düzenleme Tarihine Göre Ara"
          style={{ minWidth: "12rem" }}
          headerStyle={{ paddingLeft: '30px' }}
        />
        <Column 
          header="Anlamı Öneren"
          field="recommender"
          filter
          filterMatchMode="contains"
          filterPlaceholder="Öneren Ara"
          style={{ minWidth: "12rem" }}
          headerStyle={{ paddingLeft: '30px' }}
        />
        <Column
        body={arrows}
        style={{width:'2rem'}}
        />
        <Column 
          body={actionTemplate}
          style={{ width: '10rem' }}
        />

        <Column 
        body={wordDeleteTemplate}
       style={{ width: '4rem' }}
      />


      </TreeTable>
    </>
  );
};

export default WordTree;