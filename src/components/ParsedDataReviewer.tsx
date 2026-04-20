import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Check, AlertTriangle, Edit, Trash2, Upload, Plus, X } from 'lucide-react';
import { ParsedOutline, ParsedModule } from '../shared/courseOutlineParser';

interface ParsedDataReviewerProps {
  outline: ParsedOutline;
  onConfirm: (outline: ParsedOutline) => void;
  onCancel: () => void;
}

export function ParsedDataReviewer({ outline, onConfirm, onCancel }: ParsedDataReviewerProps) {
  const [editedOutline, setEditedOutline] = useState<ParsedOutline>(outline);
  const [isEditingModule, setIsEditingModule] = useState<{
    moduleIndex: number;
    isEditingTitle: boolean;
    isEditingTopic: boolean;
    topicIndex?: number;
  } | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');

  const handleConfirm = () => {
    onConfirm(editedOutline);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleDeleteModule = (moduleIndex: number) => {
    if (window.confirm('確定要刪除此模組及其所有主題嗎？')) {
      const updatedModules = [...editedOutline.modules];
      updatedModules.splice(moduleIndex, 1);
      setEditedOutline({
        ...editedOutline,
        modules: updatedModules,
        overallConfidence:
          updatedModules.length > 0
            ? updatedModules.reduce((sum, m) => sum + m.confidence, 0) /
              updatedModules.length
            : 0,
      });
    }
  };

  const handleDeleteTopic = (moduleIndex: number, topicIndex: number) => {
    if (
      window.confirm(
        '確定要刪除此主題嗎？此操作無法復原。'
      )
    ) {
      const updatedModules = [...editedOutline.modules];
      const updatedTopics = [...updatedModules[moduleIndex].topics];
      updatedTopics.splice(topicIndex, 1);
      updatedModules[moduleIndex].topics = updatedTopics;

      if (updatedTopics.length > 0) {
        const topicConfidence =
          updatedTopics.reduce((sum, t) => sum + t.confidence, 0) /
          updatedTopics.length;
        updatedModules[moduleIndex].confidence =
          (updatedModules[moduleIndex].confidence + topicConfidence) / 2;
      } else {
        updatedModules[moduleIndex].confidence =
          updatedModules[moduleIndex].confidence * 0.5;
      }

      setEditedOutline({
        ...editedOutline,
        modules: updatedModules,
        overallConfidence:
          updatedModules.length > 0
            ? updatedModules.reduce((sum, m) => sum + m.confidence, 0) /
              updatedModules.length
            : 0,
      });
    }
  };

  const startEditingModuleTitle = (moduleIndex: number) => {
    setIsEditingModule({
      moduleIndex,
      isEditingTitle: true,
      isEditingTopic: false,
    });
    setNewModuleTitle(editedOutline.modules[moduleIndex].title);
  };

  const startEditingTopicTitle = (moduleIndex: number, topicIndex: number) => {
    setIsEditingModule({
      moduleIndex,
      isEditingTitle: false,
      isEditingTopic: true,
      topicIndex,
    });
    setNewTopicTitle(
      editedOutline.modules[moduleIndex].topics[topicIndex].title
    );
  };

  const saveModuleTitle = (moduleIndex: number) => {
    if (newModuleTitle.trim() === '') {
      alert('模組標題不能為空');
      return;
    }

    const updatedModules = [...editedOutline.modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      title: newModuleTitle.trim(),
    };

    setEditedOutline({
      ...editedOutline,
      modules: updatedModules,
    });
    setIsEditingModule(null);
    setNewModuleTitle('');
  };

  const saveTopicTitle = (moduleIndex: number, topicIndex: number) => {
    if (newTopicTitle.trim() === '') {
      alert('主題標題不能為空');
      return;
    }

    const updatedModules = [...editedOutline.modules];
    const updatedTopics = [...updatedModules[moduleIndex].topics];
    updatedTopics[topicIndex] = {
      ...updatedTopics[topicIndex],
      title: newTopicTitle.trim(),
    };

    updatedModules[moduleIndex].topics = updatedTopics;

    setEditedOutline({
      ...editedOutline,
      modules: updatedModules,
    });
    setIsEditingModule(null);
    setNewTopicTitle('');
  };

  const addNewModule = () => {
    if (newModuleTitle.trim() === '') {
      alert('請輸入新模組標題');
      return;
    }

    const newModule: ParsedModule = {
      title: newModuleTitle.trim(),
      confidence: 0.8,
      topics: [],
    };

    setEditedOutline({
      ...editedOutline,
      modules: [...editedOutline.modules, newModule],
      overallConfidence:
        editedOutline.modules.length > 0
          ? (editedOutline.overallConfidence * editedOutline.modules.length +
              newModule.confidence) /
            (editedOutline.modules.length + 1)
          : newModule.confidence,
    });

    setNewModuleTitle('');
  };

  const addNewTopic = (moduleIndex: number) => {
    if (newTopicTitle.trim() === '') {
      alert('請輸入新主題標題');
      return;
    }

    const newTopic: { title: string; confidence: number } = {
      title: newTopicTitle.trim(),
      confidence: 0.7,
    };

    const updatedModules = [...editedOutline.modules];
    const updatedTopics = [...updatedModules[moduleIndex].topics, newTopic];
    updatedModules[moduleIndex].topics = updatedTopics;

    const topicConfidence =
      updatedTopics.reduce((sum, t) => sum + t.confidence, 0) /
      updatedTopics.length;
    updatedModules[moduleIndex].confidence =
      (updatedModules[moduleIndex].confidence + topicConfidence) / 2;

    setEditedOutline({
      ...editedOutline,
      modules: updatedModules,
    });

    setNewTopicTitle('');
  };

  const overallConfidencePercent = Math.round(
    editedOutline.overallConfidence * 100
  );

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-600" />
          解析結果檢閱
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">
            整體置信度: {overallConfidencePercent}%
          </span>
          {overallConfidencePercent >= 80 && (
            <span className="text-green-600">(良好)</span>
          )}
          {overallConfidencePercent >= 60 && overallConfidencePercent < 80 && (
            <span className="text-yellow-600">(一般)</span>
          )}
          {overallConfidencePercent < 60 && (
            <span className="text-red-600">(需改進)</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {editedOutline.modules.map((module, moduleIndex) => (
          <div
            key={moduleIndex}
            className="border border-slate-200 rounded-xl p-4"
          >
            <div className="flex justify-between items-start mb-3">
              {isEditingModule?.moduleIndex === moduleIndex &&
              isEditingModule?.isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveModuleTitle(moduleIndex);
                      } else if (e.key === 'Escape') {
                        setIsEditingModule(null);
                        setNewModuleTitle('');
                      }
                    }}
                    className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white w-64"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveModuleTitle(moduleIndex)}
                      className="px-3 py-1 bg-green-600 text-xs text-white rounded hover:bg-green-700"
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingModule(null);
                        setNewModuleTitle('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-xs text-gray-700 rounded hover:bg-gray-400"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    {module.title}
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full">
                      {Math.round(module.confidence * 100)}%
                    </span>
                  </h4>
                  <button
                    onClick={() => startEditingModuleTitle(moduleIndex)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    編輯標題
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteModule(moduleIndex)}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                刪除模組
              </button>
            </div>

            {module.topics.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 mb-1">
                  主題列表:
                </p>
                <div className="space-y-1 pl-4">
                  {module.topics.map((topic, topicIndex) => (
                    <div
                      key={topicIndex}
                      className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg"
                    >
                      {isEditingModule?.moduleIndex === moduleIndex &&
                      isEditingModule?.isEditingTopic &&
                      isEditingModule.topicIndex === topicIndex ? (
                        <>
                          <input
                            type="text"
                            value={newTopicTitle}
                            onChange={(e) => setNewTopicTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveTopicTitle(moduleIndex, topicIndex);
                              } else if (e.key === 'Escape') {
                                setIsEditingModule(null);
                                setNewTopicTitle('');
                              }
                            }}
                            className="p-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white w-64"
                            autoFocus
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() =>
                                saveTopicTitle(moduleIndex, topicIndex)
                              }
                              className="px-2 py-0.5 bg-green-600 text-xs text-white rounded hover:bg-green-700"
                            >
                              儲存
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingModule(null);
                                setNewTopicTitle('');
                              }}
                              className="px-2 py-0.5 bg-gray-300 text-xs text-gray-700 rounded hover:bg-gray-400"
                            >
                              取消
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{topic.title}</span>
                            <span className="ml-2 px-1 py-0 text-xs rounded-full">
                              {Math.round(topic.confidence * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() =>
                                startEditingTopicTitle(moduleIndex, topicIndex)
                              }
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTopic(moduleIndex, topicIndex)
                              }
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              刪除
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                此模組目前沒有主題
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="輸入新主題..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addNewTopic(moduleIndex);
                    } else if (e.key === 'Escape') {
                      setNewTopicTitle('');
                    }
                  }}
                  className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white flex-1"
                />
                <button
                  onClick={() => addNewTopic(moduleIndex)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  新增主題
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-3">新增模組</h4>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="輸入新模組標題..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addNewModule();
              } else if (e.key === 'Escape') {
                setNewModuleTitle('');
              }
            }}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white w-64"
          />
          <button
            onClick={addNewModule}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            新增模組
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
        <button
          onClick={handleCancel}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleConfirm}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          確認並使用此解析結果
        </button>
      </div>
    </div>
  );
}