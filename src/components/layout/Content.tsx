/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { queryClient } from '@/lib/api/queryClient';
import useDebounce from '@/lib/hooks/useDebounce';
import usePageMutation from '@/lib/hooks/usePageMutation';
import { newPageState, userState } from '@/lib/recoil';

import ContentHeader from './ContentHeader';

import { PageType } from '@/types';
import { queryKeys } from '@/types/commonType';

interface ContentProp {
  page?: PageType;
}

function Content({ page }: ContentProp) {
  const [newPage, setNewPage] = useRecoilState(newPageState);
  const { email } = useRecoilValue(userState);
  const [title, setTitle] = useState<string>('');
  const [desc, setDesc] = useState<string | undefined>('');
  const debouncedTitle = useDebounce({ value: title, delay: 500 });
  const debouncedDesc = useDebounce({ value: desc, delay: 500 });
  const { addPage, editPage } = usePageMutation();
  const router = useRouter();

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setDesc(page.desc);
    }
  }, [page]);

  useEffect(() => {
    setNewPage({
      ...newPage,
      creator: email,
      title: debouncedTitle,
      desc: debouncedDesc,
    });
  }, [debouncedTitle, debouncedDesc]);

  const { mutate: addPageMutate } = addPage;
  const { mutate: editPageMutate } = editPage;

  const handleAddPage = () => {
    if (!title) {
      alert('제목을 입력해주세요');
      return;
    }

    addPageMutate(newPage, {
      onSuccess: (data) => {
        queryClient.invalidateQueries(queryKeys.pages);
        if (data) {
          router.push(`/page/${data._id}`);
        }
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  const handleEditPage = () => {
    if (!title) {
      return;
    }

    const updatedPage = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...page!,
      title,
      desc,
    };
    setNewPage(updatedPage);

    editPageMutate(updatedPage, {
      onSuccess: (data) => {
        queryClient.invalidateQueries(queryKeys.pages);
        router.push(`/page/${data._id}`);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <>
      <ContentHeader />
      <div className="flex flex-col items-center p-4 sm:ml-64">
        <input
          id="message"
          className="textarea border:none mb-5 text-4xl  font-bold placeholder:text-4xl placeholder:text-gray-300"
          placeholder="제목 없음"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <input
          id="message"
          className="textarea placeholder:text-m placeholder:text-gray-400"
          placeholder="'/'를 입력해 명령어를 사용하세요"
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
        />
        <div className="mt-10 w-2/3">
          {page ? (
            <button
              className="rounded bg-green-500 px-3 py-2 text-white"
              onClick={handleEditPage}
            >
              수정
            </button>
          ) : (
            <button
              className="mr-5 rounded bg-blue-500 px-3 py-2 text-white"
              onClick={handleAddPage}
            >
              생성
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Content;
