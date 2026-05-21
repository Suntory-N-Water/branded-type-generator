import Generator from '@/components/Generator';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

describe('Generator.tsx tests', () => {
  test('正常な入力の場合に BrandedType が正しく生成されること', async () => {
    const user = userEvent.setup();
    render(<Generator />);

    // テキストエリアをクリアして新しい内容を入力
    const inputTextarea = screen.getByLabelText('Input Text');
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'id, number\nname, string');

    // 生成ボタンをクリック
    const button = screen.getByRole('button', { name: 'Generate' });
    await user.click(button);

    // 出力テキストエリアに BrandedType が含まれていることを確認
    const outputTextarea = screen.getByLabelText<HTMLTextAreaElement>('Output Text');
    const outputValue = outputTextarea.value;

    // 各部分一致を確認
    expect(outputValue).toContain('const idBrand = Symbol();');
    expect(outputValue).toContain('export type Id = number & { [idBrand]: unknown };');
    expect(outputValue).toContain('export function createId(p: number): Id {');
    expect(outputValue).toContain('return p as Id;');
    expect(outputValue).toContain('const nameBrand = Symbol();');
    expect(outputValue).toContain('export type Name = string & { [nameBrand]: unknown };');
    expect(outputValue).toContain('export function createName(p: string): Name {');
    expect(outputValue).toContain('return p as Name;');
  });

  test('`Use declare const for brand symbol` を有効にしたときに、Symbol が `declare const` で宣言されること', async () => {
    const user = userEvent.setup();
    render(<Generator />);

    // `declare const` を使用するオプションを有効にする
    const checkbox = screen.getByRole('checkbox', { name: /Use declare const for brand symbol/i });
    await user.click(checkbox);

    // テキストエリアをクリアして新しい内容を入力
    const inputTextarea = screen.getByLabelText('Input Text');
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'id, number');

    // 生成ボタンをクリック
    const button = screen.getByRole('button', { name: 'Generate' });
    await user.click(button);

    // 出力テキストエリアに `declare const` が含まれていることを確認
    const outputTextarea = screen.getByLabelText<HTMLTextAreaElement>('Output Text');
    const outputValue = outputTextarea.value;

    expect(outputValue).toContain('declare const idBrand: unique symbol;');
  });

  test('不正な形式で入力されたときにエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    render(<Generator />);

    const inputTextarea = screen.getByLabelText('Input Text');
    await user.clear(inputTextarea);

    // 不正な形式の入力
    await user.type(inputTextarea, 'id,');

    const button = screen.getByRole('button', { name: 'Generate' });
    await user.click(button);

    expect(await screen.findByText(/Invalid input format:/)).toBeInTheDocument();
  });

  test('プリミティブ型以外の型が指定された場合にエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    render(<Generator />);

    // 入力テキストにプリミティブでない型を設定
    const inputTextarea = screen.getByLabelText('Input Text');
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'something,object');

    const button = screen.getByRole('button', { name: 'Generate' });
    await user.click(button);

    expect(await screen.findByText(/is not a primitive type\./)).toBeInTheDocument();
  });

  test('エラーメッセージが表示されたあとに、正常な入力を再度送信するとエラーメッセージが消えて正しい出力が表示されること', async () => {
    const user = userEvent.setup();
    render(<Generator />);

    const inputTextarea = screen.getByLabelText('Input Text');
    const button = screen.getByRole('button', { name: 'Generate' });

    // エラーを発生させる
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'id,');
    await user.click(button);
    expect(await screen.findByText(/Invalid input format:/)).toBeInTheDocument();

    // 正常な入力を再度送信
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'id, number');
    await user.click(button);

    expect(screen.queryByText(/Invalid input format:/)).toBeNull();
    const outputTextarea = screen.getByLabelText<HTMLTextAreaElement>('Output Text');
    const outputValue = outputTextarea.value;

    expect(outputValue).toContain('export type Id = number & { [idBrand]: unknown };');
    expect(outputValue).toContain('export function createId(p: number): Id');
  });

  test('生成ボタンをクリックするたびに、出力テキストエリアの内容が更新されること', async () => {
    const user = userEvent.setup();
    render(<Generator />);

    const inputTextarea = screen.getByLabelText('Input Text');
    const button = screen.getByRole('button', { name: 'Generate' });
    const outputTextarea = screen.getByLabelText<HTMLTextAreaElement>('Output Text');

    // 最初の入力
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'post, string\nid, number');
    await user.click(button);
    let outputValue = outputTextarea.value;
    expect(outputValue).toContain('export type Post = string & { [postBrand]');

    // 変更した入力
    await user.clear(inputTextarea);
    await user.type(inputTextarea, 'age, number\nflag, boolean');
    await user.click(button);
    outputValue = outputTextarea.value;

    expect(outputValue).toContain('export type Age = number & { [ageBrand]');
    expect(outputValue).toContain('export function createAge(p: number): Age');
    expect(outputValue).toContain('export type Flag = boolean & { [flagBrand]');
    expect(outputValue).toContain('export function createFlag(p: boolean): Flag');
  });
});
