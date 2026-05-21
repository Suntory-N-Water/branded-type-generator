import { Button } from '@/components/ui/button';
import { usePreferredSymbolStyle } from '@/hooks/usePreferredSymbolStyle';
import { generateBrandedTypes } from '@/lib/generateBrandedTypes';
import { useState } from 'react';
import { Textarea } from './ui/textarea';

export default function Generator() {
  const [inputText, setInputText] = useState(`post, string
id, number`);
  const [outputText, setOutputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [preferDeclareConst, setPreferDeclareConst] = usePreferredSymbolStyle();

  function handleGenerate() {
    try {
      const result = generateBrandedTypes(inputText, {
        useDeclareConst: preferDeclareConst,
      });
      setOutputText(result);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  }

  return (
    <>
      <h1 className='text-xl font-bold mb-2'>Input</h1>
      <p>
        This tool will generate branded types for TypeScript based on the input data. The input data
        should be in CSV or Tab separated format.
      </p>
      <Textarea
        value={inputText}
        rows={8}
        onChange={(e) => setInputText(e.target.value)}
        placeholder='Please input data in CSV or Tab separated format'
        aria-label='Input Text'
      />
      <div className='flex items-center gap-4 my-2'>
        <Button onClick={handleGenerate}>Generate</Button>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='checkbox'
            checked={preferDeclareConst}
            onChange={(e) => setPreferDeclareConst(e.target.checked)}
          />
          Use <code>declare const</code> for brand symbol
        </label>
      </div>
      {errorMessage && <p className='text-red-600 font-semibold mb-4'>{errorMessage}</p>}
      <h1 className='text-xl font-bold mb-2'>Output</h1>
      <p>
        It is generated based on the best practices described in the following articles. For more
        information, please see this{' '}
        <a
          href='https://qiita.com/uhyo/items/de4cb2085fdbdf484b83'
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 hover:underline'
        >
          Branded Type Best Practices Search article
        </a>
        .
      </p>
      <Textarea
        className='bg-gray-100'
        rows={10}
        value={outputText}
        readOnly
        aria-label='Output Text'
      />
    </>
  );
}
