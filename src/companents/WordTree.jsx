import { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { BsPencil } from "react-icons/bs";
import { BsInfoCircle } from "react-icons/bs";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import "primeicons/primeicons.css";
import descriptionApi from "../api/descriptionApi";
import { InputTextarea } from "primereact/inputtextarea";

// eslint-disable-next-line react/prop-types
const WordTree = ({wordsArray,onRowEditComplete,setVisibleDeleteDescription,setDeletedDescriptionId,setWordId,setVisibleDeleteWord,
  // eslint-disable-next-line react/prop-types
  globalFilterFields,setOpenDescriptionModal,setIsWordOnly,needOrderUpdate,setNeedOrderUpdate,deletedDescriptionId,onWordEditComplete,
}) => {
  const [nodes, setNodes] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [editingRows, setEditingRows] = useState({});
  const [filters, setFilters] = useState({});
  const [visibleEditConfirm, setVisibleEditConfirm] = useState(false);
  const [visibleEditDialog, setVisibleEditDialog] = useState(false); 
  const [editingNode, setEditingNode] = useState(false);
  const [visibleInfoDialog, setVisibleInfoDialog] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [a, setA] = useState("");
  const [orderToBeUpdated, setOrderToBeUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingWordRows, setEditingWordRows] = useState({});
  const [editingWordNode, setEditingWordNode] = useState(null);
  const [visibleWordEditConfirm, setVisibleWordEditConfirm] = useState(false);
  const [editingDialogNode, setEditingDialogNode] = useState(null);
  const [editedDialogContent, setEditedDialogContent] = useState("");

  useEffect(() => {
    if (wordsArray) {
      // eslint-disable-next-line react/prop-types
      const approvedWords = wordsArray.filter((word) =>
        word.descriptions.some((desc) => desc.status === "Onaylı")
      );

      const mappedNodes = approvedWords.map((word) => ({
        key: word.wordId,
        data: {
          wordContent: word.wordContent,
          descriptionContent: "",
          lastEditedDate: "",
          recommender: "",
          status: "",
        },
        children: word.descriptions
          .filter((desc) => desc.status === "Onaylı")
          .sort((a, b) => a.order - b.order) // Sort by order
          .map((desc) => ({
            key: desc.descriptionId,
            data: {
              wordContent: word.wordContent,
              descriptionContent: desc.descriptionContent,
              lastEditedDate: desc.lastEditedDate,
              recommender: desc.recommender,
              status: desc.status,
              descriptionId: desc.descriptionId,
              order: desc.order,
            },
          })),
      }));

      const nodesWithChildren = mappedNodes.filter(
        (node) => node.children.length > 0
      );

      if (needOrderUpdate && deletedDescriptionId) {
        // eslint-disable-next-line react/prop-types
        const parentWord = wordsArray.find((word) =>
          word.descriptions.some(
            (desc) => desc.descriptionId === deletedDescriptionId
          )
        );

        if (parentWord) {
          const updatedDescriptions = parentWord.descriptions
            .filter((desc) => desc.status === "Onaylı")
            .sort((a, b) => a.order - b.order);

          updatedDescriptions.forEach((desc, index) => {
            desc.order = index + 1;
          });
        }
      }

      setNodes(nodesWithChildren);
      if (needOrderUpdate) {
        setNeedOrderUpdate(false);
      }
    }
    handleOrderUpdate();
  }, [wordsArray, a, needOrderUpdate, deletedDescriptionId]);

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

  const expandNodesMatchingFilter = (
    nodes,
    filterValue,
    expandedKeys,
    parentKey = null
  ) => {
    nodes.forEach((node) => {
      if (nodeMatchesFilter(node, filterValue)) {
        if (parentKey) expandedKeys[parentKey] = true;
        expandedKeys[node.key] = true;
      }
      if (node.children) {
        expandNodesMatchingFilter(
          node.children,
          filterValue,
          expandedKeys,
          node.key
        );
      }
    });
  };

  const nodeMatchesFilter = (node, filterValue, field = null) => {
    if (field) {
      return (
        typeof node.data[field] === "string" &&
        node.data[field].toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return Object.values(node.data).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(filterValue.toLowerCase())
    );
  };

  const onColumnFilterChange = (event) => {
    setFilters(event.filters);
    applyFilters(event.filters);
  };

  const applyFilters = (currentFilters) => {
    const hasActiveFilters = Object.values(currentFilters).some(
      (filter) => filter.value
    );

    if (!hasActiveFilters) {
      setExpandedKeys({});
      return;
    }

    const newExpandedKeys = {};
    expandNodesMatchingColumnFilters(nodes, currentFilters, newExpandedKeys);
    setExpandedKeys(newExpandedKeys);
  };

  const expandNodesMatchingColumnFilters = (nodes, filters, expandedKeys,
    parentKey = null
  ) => {
    nodes.forEach((node) => {
      const nodeMatches = Object.entries(filters).every(
        ([field, { value }]) => {
          if (!value) return true;
          return nodeMatchesFilter(node, value, field);
        }
      );

      if (nodeMatches) {
        if (parentKey) expandedKeys[parentKey] = true;
        expandedKeys[node.key] = true;
      }

      if (node.children) {
        expandNodesMatchingColumnFilters(
          node.children,
          filters,
          expandedKeys,
          node.key
        );
      }
    });
  };

  const confirmOrderUpdate = (node, direction) => {
    setNodes((prevNodes) => {
      const parentNode = prevNodes.find((n) =>
        n.children && n.children.some((child) => child.key === node.key)
      );
  
      if (!parentNode) return prevNodes; 
  
      const siblings = [...parentNode.children];
      const currentIndex = siblings.findIndex((child) => child.key === node.key);
  
      const siblingIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  
      if (siblingIndex < 0 || siblingIndex >= siblings.length) return prevNodes;
  

      [siblings[currentIndex], siblings[siblingIndex]] = [
        siblings[siblingIndex],
        siblings[currentIndex],
      ];
  
      const updatedParentNode = { ...parentNode, children: siblings };

      setOrderToBeUpdated({
        id: node.data.descriptionId,
        siblingId: siblings[siblingIndex].data.descriptionId,
        siblingCurrentOrder: siblings[siblingIndex].data.order,
        currentOrder: siblings[currentIndex].data.order,
      });
  
      return prevNodes.map((node) =>
        node.key === parentNode.key ? updatedParentNode : node
      );
    });
  
  };
  

  const handleOrderUpdate = async () => {
    if (!orderToBeUpdated) return;

    setLoading(true);
    try {
      const [moveResponse, siblingResponse] = await Promise.all([
        descriptionApi.UpdateOrder(
          orderToBeUpdated.id,
          orderToBeUpdated.currentOrder
        ),
        descriptionApi.UpdateOrder(
          orderToBeUpdated.siblingId,
          orderToBeUpdated.siblingCurrentOrder
        ),
      ]);

      if (moveResponse.isSuccess && siblingResponse.isSuccess) {
        const updatedArray = [...wordsArray];
        updatedArray.forEach((word) => {
          word.descriptions.forEach((desc) => {
            if (desc.descriptionId === orderToBeUpdated.id) {
              desc.order = orderToBeUpdated.currentOrder;
            } else if (desc.descriptionId === orderToBeUpdated.siblingId) {
              desc.order = orderToBeUpdated.siblingCurrentOrder;
            }
          });
        });

        setA((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setLoading(false);
      setOrderToBeUpdated(null);
    }
  };

  const headerTemplate = (
    <div className="flex justify-content-between align-items-center">
      <span className="p-input-icon-left">
        {/* <i
          className="pi pi-search"
          style={{ marginLeft: 190, marginTop: -10 }}
        /> */}
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
      await onRowEditComplete({
        newData: editingNode.data,
        index: editingNode,
      });
      const newEditingRows = { ...editingRows };
      delete newEditingRows[editingNode.key];
      setEditingRows(newEditingRows);
    } catch (error) {
      console.error("Row edit failed:", error);
    }
    setVisibleEditConfirm(false);
  };

  const arrows = (node) => {
    const parentNode = nodes.find(
      (n) => n.children && n.children.some((child) => child.key === node.key)
    );

    if (!parentNode || parentNode.children.length <= 1) {
      return null;
    }

    const siblings = parentNode.children;
    const currentIndex = siblings.findIndex((child) => child.key === node.key);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === siblings.length - 1;

    if (!node.children) {
      return (
        <>
          <div>
            {!isFirst && (
              <div onClick={() => confirmOrderUpdate(node, "up")}>
                <i
                  className="pi pi-arrow-circle-up"
                  style={{
                    cursor: "pointer",
                    opacity: loading ? 0.5 : 1,
                    pointerEvents: loading ? "none" : "auto",
                  }}
                />
              </div>
            )}

            {!isLast && (
              <div onClick={() => confirmOrderUpdate(node, "down")}>
                <i
                  className="pi pi-arrow-circle-down"
                  style={{
                    cursor: "pointer",
                    opacity: loading ? 0.5 : 1,
                    pointerEvents: loading ? "none" : "auto",
                  }}
                />
              </div>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  const actionTemplate = (node) => {
    if (!node.children) {
      return (
        <div style={{ display: "inline-flex", gap: "5px" }}>
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
        </div>
      );
    }
    return (
      <div style={{ display: "inline-flex", gap: "5px" }}>
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
          {/* <Tooltip
            target={`.delete-word-${node.key}`}
            content="Kelimeyi Sil"
            tooltipOptions={{ position: "left " }}
            tooltipClassName="tooltip-word-delete"
          /> */}

          <Button
            tooltip="Kelimeyi Sil"
            tooltipOptions={{ showDelay: 250, position: "left" }}
            className={`delete-word delete-word-${node.key}`}
            icon="pi pi-trash"
            onClick={() => {
              setWordId(node.key);
              setVisibleDeleteWord(true);
            }}
          ></Button>
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

  const handleDialogEdit = () => {
    if (!currentNode) return;
    setEditingDialogNode(currentNode);
    setEditedDialogContent(currentNode.data.descriptionContent);
  };

  const handleDialogEditComplete = async () => {
    if (!editingDialogNode) return;

    const editData = {
      newData: {
        ...editingDialogNode.data,
        descriptionContent: editedDialogContent,
      },
      index: editingDialogNode,
    };

    try {
      await onRowEditComplete(editData);
      setEditingDialogNode(null);

      // Update the node in the tree
      const newNodes = [...nodes];
      const editedNode = findNodeByKey(newNodes, editingDialogNode.key);
      if (editedNode) {
        editedNode.data.descriptionContent = editedDialogContent;
        setNodes(newNodes);
      }
    } catch (error) {
      console.error("Dialog edit failed:", error);
    }
  };

  const renderInfoDialog = () => {
    return (
      <Dialog
        visible={visibleInfoDialog}
        onHide={() => {
          setVisibleInfoDialog(false);
          setEditingDialogNode(null);
        }}
        header="Anlam Bilgileri"
        modal
        style={{ width: "50vw" }}
      >
        {currentNode && (
          <div className="info-dialog-grid">
            <div className="info-item">
              <strong>Açıklama:</strong>
              <div className="flex align-items-center">
                {editingDialogNode ? (
                  <>
                  
                    <InputTextarea
                      cols = {50}
                      value={editedDialogContent}
                      onChange={(e) => setEditedDialogContent(e.target.value)}
                      className="w-full"
                      autoResize
                    />
                    <Button
                      icon="pi pi-check"
                      className="p-button-rounded p-button-success p-mr-2"
                      onClick={handleDialogEditComplete}
                    />
                    <Button
                      icon="pi pi-times"
                      className="p-button-rounded p-button-danger x"
                      onClick={() => setEditingDialogNode(null)}
                    />
                  </>
                ) : (
                  <>
                      <p className="mr-2">
                        {currentNode.data.descriptionContent}
                      </p>
                      <Button
                        icon={<BsPencil />}
                        className="p-button-rounded p-button-success"
                        style={{
                          background: "transparent",
                          border: "transparent",
                          margin: 'auto',
                        }}
                        onClick={handleDialogEdit}
                      />
                  </>
                )}
              </div>
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

  const startWordEdit = (node) => {
    const newNode = {
      key: node.key,
      data: { ...node.data },
      originalContent: node.data.wordContent,
    };
    setEditingWordNode(newNode);
    setVisibleEditDialog(true); 
    setEditingWordRows({ ...editingWordRows, [node.key]: true });
  };

  const onWordEditorValueChange = (options, value) => {
    const newNodes = [...nodes];
    const editedNode = findNodeByKey(newNodes, options.node.key);
    if (editedNode) {
      editedNode.data[options.field] = value;
      setNodes(newNodes);
    }

    setEditingWordNode((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [options.field]: value,
      },
    }));
  };

  const handleWordEditComplete = (node) => {
    setVisibleWordEditConfirm(true);
  };

  const confirmWordEdit = async () => {
    if (!editingWordNode) {
      return;
    }

    try {
      const success = await onWordEditComplete(
        editingWordNode.key,
        editingWordNode.data.wordContent
      );

      if (success) {
        const newEditingWordRows = { ...editingWordRows };
        delete newEditingWordRows[editingWordNode.key];
        setEditingWordRows(newEditingWordRows);

        const newNodes = nodes.map((node) => {
          if (node.key === editingWordNode.key) {
            return {
              ...node,
              data: {
                ...node.data,
                wordContent: editingWordNode.data.wordContent,
              },
            };
          }
          return node;
        });
        setNodes(newNodes);
      }
    } catch (error) {
      console.error(error);
    }

    setVisibleWordEditConfirm(false);
    setEditingWordNode(null);
  };

  const cancelWordEdit = (node) => {
    const newEditingWordRows = { ...editingWordRows };
    delete newEditingWordRows[node.key];
    setEditingWordRows(newEditingWordRows);

    const newNodes = [...nodes];
    const nodeToReset = findNodeByKey(newNodes, node.key);
    if (nodeToReset && editingWordNode) {
      nodeToReset.data.wordContent = editingWordNode.originalContent;
      setNodes(newNodes);
    }

    setEditingWordNode(null);
  };

  const wordContentTemplate = (node) => {
    if (node.children) {
      if (editingWordRows[node.key]) {
        return (
          <>
          {/* Dialog bileşeni */}
          <Dialog
              header="Kelime Düzenle"
              visible={visibleEditDialog}
              onHide={() => setVisibleEditDialog(false)/cancelWordEdit(editingWordNode)} // Dialogu kapat
              footer={
                  <div className="flex align-items-center">
                      <InputText
                          type="text"
                          value={editingWordNode?.data.wordContent} // Düzenlenecek kelimenin içeriği
                          onChange={(e) =>
                              onWordEditorValueChange(
                                  { node: editingWordNode, field: "wordContent" },
                                  e.target.value
                              )
                          }
                          className="mr-2"
                      />
                      <Button
                          icon="pi pi-check"
                          className="p-button-rounded p-button-success p-mr-2"
                          onClick={() => {
                              handleWordEditComplete(editingWordNode); // Onay butonu
                              setVisibleEditDialog(false); // Dialogu kapat
                          }}
                          style={{ marginLeft: "10px" }}
                      />
                      <Button
                          icon="pi pi-times"
                          className="p-button-rounded p-button-danger"
                          onClick={() => {
                              cancelWordEdit(editingWordNode); // İptal butonu
                              setVisibleEditDialog(false); // Dialogu kapat
                          }}
                          style={{ marginLeft: "4px" }}
                      />
                  </div>
              }
          >
              {/* Dialog içeriği burada */}
              <p>Düzenlemek istediğiniz kelimeyi giriniz.</p>
          </Dialog>

      </>
        );
      }
      return (
        <div className="flex align-items-center">
          <span className="mr-2">{node.data.wordContent}</span>
          <Button
            icon={<BsPencil />}
            className="p-button-rounded p-button-success"
            style={{
              background: "transparent",
              marginLeft: "10px",
              border: "transparent",
            }}
            onClick={() => startWordEdit(node)}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {renderInfoDialog()}
      <ConfirmDialog
        visible={visibleEditConfirm}
        onHide={() => setVisibleEditConfirm(false)}
        message="Bu anlamı güncellemek istediğinizden emin misiniz?"
        header="Anlamı Güncellemeyi Onayla"
        icon="pi pi-exclamation-triangle"
        accept={confirmEdit}
        reject={cancelEdit}
        acceptLabel="Evet"
        rejectLabel="Hayır"
      />
      <ConfirmDialog
        visible={visibleWordEditConfirm}
        onHide={() => {
          setVisibleWordEditConfirm(false);
          setEditingWordNode(null);
        }}
        message="Bu kelimeyi güncellemek istediğinizden emin misiniz?"
        acceptLabel="Evet"
        rejectLabel="Hayır"
        header="Kelime Güncellemeyi Onayla"
        icon="pi pi-exclamation-triangle"
        accept={confirmWordEdit}
        reject={() => {
          cancelWordEdit(editingWordNode);
          setVisibleWordEditConfirm(false);
        }}
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
        paginator
        rows={10}
      >
        <Column
          field="wordContent"
          header="Kelimeler"
          expander
          filter
          filterPlaceholder="Kelimeleri Ara"
          filterMatchMode="contains"
          body={wordContentTemplate}
          style={{ minWidth: "12rem", borderTopLeftRadius: 15 }}
          bodyStyle={{ padding: 25 }}
          headerStyle={{ paddingLeft: "30px" }}
        />
        <Column
          header="Anlam"
          field="descriptionContent"
          filter
          filterMatchMode="contains"
          filterPlaceholder="Anlamları Ara"
          body={(node) =>
            editingRows[node.key] ? (
              inputTextEditor({
                rowData: node.data,
                field: "descriptionContent",
                node,
              })
            ) : (
              <>
                <div
                  className={`description-content-${node.key}`}
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "300px",
                  }}
                >
                  {node.data.descriptionContent}
                </div>
              </>
            )
          }
          style={{ minWidth: "12rem" }}
          headerStyle={{ paddingLeft: "30px" }}
        />

        <Column
          header="Son Düzenleme Tarihi"
          field="lastEditedDate"
          filter
          filterMatchMode="contains"
          filterPlaceholder="Son Düzenleme Tarihine Göre Ara"
          style={{ minWidth: "12rem" }}
          headerStyle={{ paddingLeft: "30px" }}
        />
        <Column
          header="Anlamı Öneren"
          field="recommender"
          filter
          filterMatchMode="contains"
          filterPlaceholder="Öneren Ara"
          style={{ minWidth: "12rem" }}
          headerStyle={{ paddingLeft: "30px" }}
        />
        <Column body={arrows} style={{ width: "2rem" }} />
        <Column body={actionTemplate} style={{ width: "10rem" }} />

        <Column body={wordDeleteTemplate} style={{ width: "4rem" }} />
      </TreeTable>
    </>
  );
};

export default WordTree;
