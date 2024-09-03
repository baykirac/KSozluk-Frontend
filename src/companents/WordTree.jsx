

import React, { useState, useEffect } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const WordTree = ({ 
  wordsArray, 
  onRowEditComplete, 
  setVisibleDeleteDescription, 
  setDeletedDescriptionId, 
  setWordId, 
  cm2, 
  globalFilterFields,
  setOpenModal
}) => {
  const [nodes, setNodes] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [editingRows, setEditingRows] = useState({});
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (wordsArray) {
      const mappedNodes = wordsArray.map(word => ({
        key: word.wordId,
        data: { 
          wordContent: word.wordContent,
          descriptionContent: '',
          lastEditedDate: '',
          recommender: '',
          status: ''
        },
        children: word.descriptions.map(desc => ({
          key: desc.descriptionId,
          data: {
            wordContent: word.wordContent,
            descriptionContent: desc.descriptionContent,
            lastEditedDate: desc.lastEditedDate,
            recommender: desc.recommender,
            status: desc.status
          }
        }))
      }));
      setNodes(mappedNodes);
    }
  }, [wordsArray]);

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
        tooltipOptions={{ showDelay: 250, mouseTrack: true }}
        label="Yeni Kelime Ekle"
        icon="pi pi-plus"
        className="custom-button"
        onClick={() => {
          setOpenModal(true);
        }}
        style={{ marginLeft: "2rem" }}
        size={36}
      />
    </div>
  );

  const handleRowEditComplete = async (node) => {
    try {
      await onRowEditComplete({ newData: node.data, index: node });
      // Düzenleme modundan çık
      const newEditingRows = { ...editingRows };
      delete newEditingRows[node.key];
      setEditingRows(newEditingRows);
    } catch (error) {
      console.error("Row edit failed:", error);
      // Hata durumunda düzenleme modunda kal
    }
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
      <>
        {!node.children && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-success p-mr-2"
            onClick={() => startEdit(node)}
          />
        )}
        {!node.children && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger"
            onClick={() => {
              setVisibleDeleteDescription(true);
              setDeletedDescriptionId(node.key);
            }}
          />
        )}
      </>
    );
  };

  const startEdit = (node) => {
    setEditingRows({ ...editingRows, [node.key]: true });
  };

  const cancelEdit = (node) => {
    const newEditingRows = { ...editingRows };
    delete newEditingRows[node.key];
    setEditingRows(newEditingRows);
  };

  return (
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
      />
      <Column 
        header="Açıklama"
        field="descriptionContent"
        filter
        filterMatchMode="contains"
        filterPlaceholder="Açıklamaları Ara"
        body={(node) => (
          editingRows[node.key] ? inputTextEditor({ rowData: node.data, field: 'descriptionContent', node }) : node.data.descriptionContent
        )}
        style={{ minWidth: "12rem" }}
      />
      <Column 
        header="Son Düzenleme Tarihi"
        field="lastEditedDate"
        filter
        filterMatchMode="contains"
        filterPlaceholder="Son Düzenleme Tarihine Göre Ara"
        style={{ minWidth: "12rem" }}
      />
      <Column 
        header="Anlamı Öneren"
        field="recommender"
        filter
        filterMatchMode="contains"
        filterPlaceholder="Öneren Ara"
        style={{ minWidth: "12rem" }}
      />
      <Column 
        body={actionTemplate}
        style={{ width: '10rem' }}
      />
    </TreeTable>
  );
};

export default WordTree;