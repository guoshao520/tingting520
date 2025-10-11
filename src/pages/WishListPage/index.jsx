import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishListPage.less';
import { FaArrowLeft, FaTrashAlt } from 'react-icons/fa';
import wish from '@/api/wish'; // 引入愿望清单接口
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';
import EmptyState from '@/components/EmptyState';
import { Dialog } from 'antd-mobile';

const WishlistPage = () => {
  const navigate = useNavigate();
  // 1. 初始值明确设为数组，避免undefined/null
  const [wishes, setWishes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loginInfo = getLoginInfo();
  const couple_id = loginInfo?.couple?.id;

  // 获取愿望列表数据
  const fetchWishes = async () => {
    try {
      setLoading(true);
      const data = await wish.list({ couple_id });

      if (data.code === 200) {
        // 2. 强制转为数组（防止后端返回null/object等非数组格式）
        const validWishes = Array.isArray(data.data?.rows)
          ? data.data?.rows
          : [];
        setWishes(validWishes);
      } else {
        setWishes([]); // 接口返回错误时，也确保wishes是数组
      }
    } catch (err) {
      console.error('获取愿望列表错误:', err);
      setWishes([]); // 网络错误时，同样确保wishes是数组
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchWishes();
  }, []);

  // 切换完成状态
  const toggleComplete = async (id, currentStatus) => {
    try {
      // 3. 用函数式更新确保拿到最新的wishes状态（避免闭包问题）
      setWishes((prevWishes) =>
        prevWishes.map((wish) =>
          wish.id === id ? { ...wish, is_completed: !currentStatus } : wish
        )
      );

      // 调用接口更新状态
      const data = await wish.complete(id, {
        completed: !currentStatus,
      });

      if (data.code === 200) {
        toastSuccess(data.message);
      } else {
        // 接口失败时回滚状态（同样用函数式更新）
        setWishes((prevWishes) =>
          prevWishes.map((wish) =>
            wish.id === id ? { ...wish, is_completed: currentStatus } : wish
          )
        );
        toastFail(data.message);
      }
    } catch (error) {
      console.error('更新状态错误:', error);
      // 网络错误时回滚状态
      setWishes((prevWishes) =>
        prevWishes.map((wish) =>
          wish.id === id ? { ...wish, is_completed: currentStatus } : wish
        )
      );
      toastFail(error.message || '网络错误，更新失败');
    }
  };

  // 删除愿望
  const deleteWish = async (id) => {
    Dialog.confirm({
      content: '确定要删除这个愿望吗？',
      onConfirm: async () => {
        try {
          // 先缓存当前数组（用于回滚）
          const originalWishes = [...wishes];
          // 4. 过滤时确保返回数组
          setWishes((prevWishes) =>
            prevWishes.filter((wish) => wish.id !== id)
          );

          // 调用接口删除
          const data = await wish.delete(id, { couple_id });

          if (data.code !== 200) {
            // 接口失败时回滚
            setWishes(originalWishes);
            toastFail(data.message);
          }
        } catch (error) {
          console.error('删除愿望错误:', error);
          // 网络错误时回滚
          setWishes(wishes.filter((wish) => wish.id !== id));
          toastFail(error.message || '网络错误，删除失败');
        }
      },
    });
  };

  // 筛选逻辑：5. 先判断wishes是否为数组，再执行filter
  const filteredWishes = Array.isArray(wishes)
    ? wishes.filter((wish) => {
        if (filter === 'all') return true;
        if (filter === 'active') return !wish.is_completed;
        if (filter === 'completed') return wish.is_completed;
        return true;
      })
    : []; // 非数组时返回空数组，避免报错

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 优先级文本
  const getPriorityText = (level) => {
    const map = { 1: '低', 2: '中', 3: '高' };
    return map[level] || '中';
  };

  const handleBack = () => {
    window.history.back();
  };

  const addWish = () => {
    navigate('/add-wish');
  };

  return (
    <div>
      <div className="wishlist-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h3>我们的愿望清单</h3>
        <button className="add-btn" onClick={addWish}>
          + 新增心愿
        </button>
      </div>
      <div className="wishlist-container">
        {/* 筛选栏 */}
        <div className="filter-bar">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            未完成
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
        </div>

        {/* 愿望列表 */}
        <div className="wish-list">
          {filteredWishes.length === 0 ? (
            <EmptyState marginTop={0} />
          ) : (
            filteredWishes.map((wishItem) => (
              // 6. 变量名改为wishItem，避免与引入的api模块名（wish）冲突
              <div
                key={wishItem.id}
                className={`wish-item ${
                  wishItem.is_completed ? 'completed' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={wishItem.is_completed}
                  onChange={() =>
                    toggleComplete(wishItem.id, wishItem.is_completed)
                  }
                  className="complete-checkbox"
                />

                <div className="wish-content">
                  <h3 className="wish-title">{wishItem.title}</h3>
                  {wishItem.description && (
                    <p className="wish-desc">{wishItem.description}</p>
                  )}

                  <div className="wish-meta">
                    <span className={`priority priority-${wishItem.priority}`}>
                      {getPriorityText(wishItem.priority)}优先级
                    </span>
                    {wishItem.target_date && (
                      <span className="target-date">
                        目标：{formatDate(wishItem.target_date)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deleteWish(wishItem.id)}
                  aria-label="删除"
                >
                  <FaTrashAlt style={{ color: '#ef4444' }} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
