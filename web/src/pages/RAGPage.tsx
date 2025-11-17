import { useState, useEffect } from 'react';
import { Upload, Search, Loader2, FileText, Database, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  indexDocuments,
  queryRAG,
  getRAGStats,
  clearRAG,
  type RAGStatsResponse,
  type RAGQueryResponse,
} from '../api/rag';

const RAGPage = () => {
  const [activeTab, setActiveTab] = useState<'index' | 'query'>('index');
  const [documents, setDocuments] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RAGStatsResponse | null>(null);
  const [queryResult, setQueryResult] = useState<RAGQueryResponse | null>(null);
  const [indexMessage, setIndexMessage] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getRAGStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleIndex = async () => {
    if (!documents.trim() || loading) return;

    setLoading(true);
    setIndexMessage('');

    try {
      const docs = documents
        .split('\n\n')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const response = await indexDocuments({ documents: docs });
      setIndexMessage(`成功索引 ${response.count} 个文档，总计 ${response.total || 0} 个文档`);
      setDocuments('');
      await loadStats();
    } catch (error) {
      setIndexMessage('索引失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setQueryResult(null);

    try {
      const response = await queryRAG({ query: query.trim(), top_k: 3 });
      setQueryResult(response);
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('确定要清空所有文档吗？')) return;

    try {
      await clearRAG();
      setIndexMessage('已清空所有文档');
      await loadStats();
    } catch (error) {
      setIndexMessage('清空失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">RAG 检索增强生成</h1>
          <p className="mt-2 text-slate-600">
            索引你的文档，然后通过智能检索获取精准答案
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">文档数量</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stats?.total_documents || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">文本块数</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stats?.total_chunks || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">向量维度</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stats?.vector_dimension || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('index')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'index'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Upload className="mr-2 inline h-4 w-4" />
            索引文档
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'query'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Search className="mr-2 inline h-4 w-4" />
            查询问答
          </button>
          {stats && stats.total_documents > 0 && (
            <button
              onClick={handleClear}
              className="ml-auto rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 className="mr-2 inline h-4 w-4" />
              清空文档
            </button>
          )}
        </div>

        {/* Index Tab */}
        {activeTab === 'index' && (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  文档内容
                </label>
                <textarea
                  value={documents}
                  onChange={(e) => setDocuments(e.target.value)}
                  placeholder="输入要索引的文档内容，多个文档用空行分隔..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={12}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-slate-500">
                  提示：每个段落用空行分隔，系统会自动将它们作为独立文档索引
                </p>
              </div>

              <div className="flex items-center justify-between">
                {indexMessage && (
                  <p className="text-sm text-slate-600">{indexMessage}</p>
                )}
                <Button
                  onClick={handleIndex}
                  disabled={loading || !documents.trim()}
                  size="lg"
                  className="ml-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      索引中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      开始索引
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Query Tab */}
        {activeTab === 'query' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    查询问题
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="输入你的问题，系统会从已索引的文档中检索相关信息..."
                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleQuery}
                  disabled={loading || !query.trim() || !stats || stats.total_documents === 0}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      查询中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      开始查询
                    </>
                  )}
                </Button>

                {!stats || stats.total_documents === 0 && (
                  <p className="text-center text-sm text-slate-500">
                    请先索引一些文档后再进行查询
                  </p>
                )}
              </div>
            </Card>

            {/* Query Result */}
            {queryResult && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">查询结果</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-700">AI 回答：</h4>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-slate-900">
                        {queryResult.answer}
                      </p>
                    </div>
                  </div>

                  {queryResult.documents && queryResult.documents.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-slate-700">
                        参考来源：
                      </h4>
                      <div className="space-y-3">
                        {queryResult.documents.map((source, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="text-xs font-medium text-slate-500">
                                来源 {index + 1}
                                {queryResult.relevance_scores &&
                                  queryResult.relevance_scores[index] && (
                                    <span className="ml-2 text-green-600">
                                      相关度: {(queryResult.relevance_scores[index] * 100).toFixed(1)}%
                                    </span>
                                  )}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">{source}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGPage;
