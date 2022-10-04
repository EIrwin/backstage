/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getVoidLogger } from '@backstage/backend-common';
import {
  createBackendModule,
  loggerServiceRef,
} from '@backstage/backend-plugin-api';
import { startTestBackend } from '@backstage/backend-test-utils';
import { eventsExtensionPoint } from '@backstage/plugin-events-node';
import {
  TestEventBroker,
  TestEventPublisher,
  TestEventSubscriber,
} from '@backstage/plugin-events-backend-test-utils';
import { eventsPlugin } from './EventsPlugin';

describe('eventPlugin', () => {
  it('should be initialized properly', async () => {
    const eventBroker = new TestEventBroker();
    const publisher = new TestEventPublisher();
    const subscriber = new TestEventSubscriber('sub', ['topicA']);

    const testModule = createBackendModule({
      pluginId: 'events',
      moduleId: 'test',
      register(env) {
        env.registerInit({
          deps: {
            events: eventsExtensionPoint,
          },
          async init({ events }) {
            events.setEventBroker(eventBroker);
            events.addPublishers(publisher);
            events.addSubscribers(subscriber);
          },
        });
      },
    });

    await startTestBackend({
      extensionPoints: [],
      services: [[loggerServiceRef, getVoidLogger()]],
      features: [eventsPlugin(), testModule()],
    });

    expect(publisher.eventBroker).toBe(eventBroker);
    expect(eventBroker.subscribed.length).toEqual(1);
    expect(eventBroker.subscribed[0]).toBe(subscriber);
  });
});
