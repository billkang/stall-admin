import { faker } from '@faker-js/faker';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse } from '~/utils/response';

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    const dataItem = {
      id: faker.string.uuid(),
      userName: faker.person.firstName(),
      imageUrl: faker.image.avatar(),
      email: faker.internet.email(),
      gender: faker.person.gender(),
      phone: faker.phone.number(),
      position: faker.location.streetAddress(),
      roleName: faker.person.jobTitle(),
      status: faker.helpers.arrayElement(['online', 'offline']),
      supplier: faker.company.name(),
    };

    dataList.push(dataItem);
  }

  return dataList;
}

const mockData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  await sleep(600);

  const { page, pageSize } = getQuery(event);
  const listData = structuredClone(mockData);

  return usePageResponseSuccess(page as string, pageSize as string, listData);
});
