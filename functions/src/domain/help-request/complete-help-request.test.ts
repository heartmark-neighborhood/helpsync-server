describe('ヘルプ完了通知', () => {
  it('ヘルプ完了通知を受け取ると、ヘルプ要請の状態が更新される', async () => {
    const mockRequest = { id: '1', status: 'pending' };
    const expectedResponse = { id: '1', status: 'completed' };

    const result = await completeHelpRequest(mockRequest);
    expect(result).toEqual(expectedResponse);
  });
});