import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirestore = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // コレクションが存在しない場合でもエラーにならないように、シンプルなクエリから始める
    const collectionRef = collection(db, collectionName);
    
    const unsubscribe = onSnapshot(collectionRef, 
      (snapshot) => {
        console.log(`📊 Firestore ${collectionName} snapshot:`, {
          size: snapshot.size,
          empty: snapshot.empty,
          docs: snapshot.docs.length
        });
        
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // createdAtでソート（存在する場合のみ）
        const sortedDocs = docs.sort((a: any, b: any) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });
        
        setData(sortedDocs);
        setLoading(false);
      },
      (err) => {
        console.error(`❌ Firestore ${collectionName} error:`, err);
        setError(err.message);
        setData([]); // エラー時は空配列を設定
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const addDocument = async (data: any) => {
    try {
      setLoading(true);
      const docData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, collectionName), docData);
      setLoading(false);
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setLoading(false);
      throw err;
    }
  };

  const updateDocument = async (id: string, data: any) => {
    try {
      setLoading(true);
      const docData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      await updateDoc(doc(db, collectionName, id), docData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setLoading(false);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, collectionName, id));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setLoading(false);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  };
};